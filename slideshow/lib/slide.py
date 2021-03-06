#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os, os.path, sys, json
import slideshow.lib.assembler as asm
import shutil, uuid
from slideshow.settings import Settings
from slideshow.lib.resolution import Resolution
import slideshow.event as event
import cherrypy
import traceback
import time, calendar

class InvalidSlide(Exception):
    pass

class Slide(object):
    def __init__(self, id, queue, timestamp, path, active, assembler, data, stub=False, validate_path=True):
        self.id = id
        self._queue = queue
        self.timestamp = timestamp and calendar.timegm(time.strptime(timestamp, '%Y-%m-%d %H:%M:%S')) or None
        self._path = path
        self.active = active
        self.assembler = asm.get(assembler)
        self.classes = ['slide']
        try:
            self._data = data and json.loads(data) or None
        except:
            print >> sys.stderr, 'Data was:', [data]
            raise

        # Tells if this is a full slide (which database entry) or if it is being
        # constructed or is otherwise not complete.
        self._stub = stub

        if validate_path and not os.path.exists(path):
            settings = Settings()
            base_path = settings['Path.BasePath']
            image_path = settings['Path.Image']
            raise ValueError, "could not locate '{path}' in '{root}'".format(path=path, root=os.path.join(base_path, image_path))

    def as_json(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp,
            'active': self.active,
            'is_viewable': self.assembler.is_viewable(),
            'is_playable': self.assembler.is_playable(),
            'is_editable': self.assembler.is_editable(),
        }

    def __getattribute__(self, key):
        if key == 'attributes':
            cls = list(self.classes)
            if not self.active: cls.append('disabled')

            return {
                'class': ' '.join(cls)
            }

        return object.__getattribute__(self, key)

    def assemble(self, params):
        return json.dumps(self.assembler.assemble(self, **params))

    def default_size(self, width=None):
        return self.assembler.default_size(slide=self, params=self._data, width=width)

    def raster_path(self, size=None):
        settings = Settings()
        base_path = settings['Path.BasePath']
        image_path = settings['Path.Image']

        args = [base_path, image_path, self._path, 'raster']
        if size != None:
            args.append(str(size) + self.assembler.raster_extension())
        return os.path.join(*args)

    def src_path(self, item):
        settings = Settings()
        base_path = settings['Path.BasePath']
        image_path = settings['Path.Image']

        return os.path.join(base_path, image_path, self._path, 'src', item)

    def update(self, db, kwargs):
        self._data = self.assembler.update(self, self._data, **kwargs)
        with db:
            db.execute('UPDATE `slide` SET `data` = :data, `timestamp` = CURRENT_TIMESTAMP WHERE id = :id', dict(id=self.id, data=json.dumps(self._data)))

        self.rebuild_cache(Settings().resolution())

    def _has_raster(self, size):
        return os.path.exists(self.raster_path(size))

    def rasterize(self, size):
        """
        Rasterizes the slide for the given resolution, if needed.
        :param size: Size of the raster
        """
        if not self._has_raster(size) or not self.assembler.raster_is_valid(size=size, params=self._data):
            self.assembler.rasterize(slide=self, size=size, params=self._data)

    def _invalidate(self):
        path = self.raster_path()
        for root, dirs, files in os.walk(path):
            [os.remove(os.path.join(root,x)) for x in files]

    def rebuild_cache(self, resolution):
        self._invalidate()
        self.rasterize(Resolution(200,200)) # thumbnail
        self.rasterize(Resolution(800,600)) # windowed mode (debug)
        self.rasterize(resolution)

    def switch(self, c, dst):
        head, tail = os.path.split(self._path)
        self._path = os.path.join(dst, 'image', tail)
        c.execute('UPDATE slide SET path = :path WHERE id = :id', dict(path=self._path, id=self.id))
        return self._path

def all(c, validate_path=True):
    return [Slide(queue=None, validate_path=validate_path, **x) for x in c.execute("""
        SELECT
            id,
            DATETIME(`timestamp`) AS `timestamp`,
            path,
            active,
            assembler,
            data
        FROM
            slide
        """).fetchall()]

def from_id(c, id):
    row = c.execute("""
        SELECT
            id,
            DATETIME(`timestamp`) AS `timestamp`,
            path,
            active,
            assembler,
            data
        FROM
            slide
        WHERE
            id = :id
        LIMIT 1
    """, {'id': id}).fetchone()

    if not row:
        raise InvalidSlide, "No slide with id '{id}'".format(id=id)

    return Slide(queue=None, stub=False, **row)

def create(c, assembler, params):
    settings = Settings()

    base_path = settings['Path.BasePath']
    image_path = settings['Path.Image']

    name = '{uuid}.slide'.format(uuid=uuid.uuid1().hex)
    dst = os.path.join(base_path, image_path, name)

    os.mkdir(dst)
    os.mkdir(os.path.join(dst, 'raster'))
    os.mkdir(os.path.join(dst, 'src'))

    # reference resolution
    params['resolution'] = settings.resolution()

    slide = Slide(id=None, timestamp=None, queue=None, path=dst, active=False, assembler=assembler, data=None, stub=True)
    slide._data = json.loads(slide.assemble(params))
    slide.rebuild_cache(settings.resolution())

    data = dict(path=slide._path, assembler=slide.assembler.name, data=json.dumps(slide._data))
    try:
        c.execute("""
            INSERT INTO slide (
                `timestamp`,
                queue_id,
                path,
                assembler,
                data
            ) VALUES (
                CURRENT_TIMESTAMP,
                1,
                :path,
                :assembler,
                :data
            )
        """, data)
    except:
        traceback.print_exc()
        print >> sys.stderr, 'Data'
        for k,v in data.iteritems():
            print >> sys.stderr, '%s=%s' % (k,v)
        raise

    return slide

def edit(c, id, assembler, params):
    settings = Settings()

    # reference resolution
    params['resolution'] = settings.resolution()

    slide = from_id(c, id)
    slide._data = json.loads(slide.assemble(params))
    slide.rebuild_cache(settings.resolution())

    c.execute("""
        UPDATE
            slide
        SET
            data = :data,
            `timestamp` = CURRENT_TIMESTAMP
        WHERE
            id = :id
    """, dict(id=id, data=json.dumps(slide._data)))

def delete(db, id):
    with db:
        # validate that the slide exists
        s = from_id(db, id)

        # delete slide from database
        db.execute("""
            DELETE FROM
                slide
            WHERE
                id = :id
        """, dict(id=s.id))

        # remove all resources
        shutil.rmtree(s._path)

def activate(db, id):
    with db:
        s = from_id(db, id)
        db.execute('UPDATE slide SET active = 1 WHERE id = :id', dict(id=s.id))

        # fulhack
        s.active = True
        return s

def deactivate(db, id):
    with db:
        s = from_id(db, id)
        db.execute('UPDATE slide SET active = 0 WHERE id = :id', dict(id=s.id))

        # fulhack
        s.active = False
        return s

@event.listener
class EventListener:
    @event.callback('maintenance.rebuild')
    def flush(self, progresss):
        c = cherrypy.thread_data.db
        settings = Settings()

        slides = [Slide(queue=None, **x) for x in c.execute("""
            SELECT
                id,
                DATETIME(`timestamp`) AS `timestamp`,
                path,
                active,
                assembler,
                data
            FROM
                slide
        """).fetchall()]

        for n, slide in enumerate(slides):
            progresss(str(float(n+1) / len(slides) * 100) + '%<br/>\n')
            slide.rebuild_cache(settings.resolution())

    @event.callback('config.resolution_changed')
    def resolution_changed(self, resolution):
        cherrypy.engine.log('Resolution changed, rebuilding cache')
        c = cherrypy.thread_data.db

        slides = [Slide(queue=None, **x) for x in c.execute("""
            SELECT
                id,
                DATETIME(`timestamp`) AS `timestamp`,
                path,
                active,
                assembler,
                data
            FROM
                slide
        """).fetchall()]

        for slide in slides:
            params = slide._data
            params['resolution'] = resolution

            slide._data = json.loads(slide.assemble(params))
            slide.rebuild_cache(resolution)

            c.execute("""
                UPDATE
                    slide
                SET
                    data = :data
                WHERE
                    id = :id
            """, dict(id=slide.id, data=json.dumps(slide._data)))

        cherrypy.thread_data.db.commit()

_listener = EventListener()
