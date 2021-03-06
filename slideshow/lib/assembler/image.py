#!/usr/bin/env python
# -*- coding: utf-8 -*-

from . import Assembler
from slideshow.lib.resolution import Resolution
import subprocess, pipes
import PythonMagick
import sys, traceback

class ImageAssembler(Assembler):
    def is_editable(self):
        return False

    def assemble(self, slide, filename, **kwargs):
        # this _hack_ is needed because when the image slide is rebuild (e.g.
        # by resolution changed trigger) only a filename instead of upload
        # handle is passed. Since an image slide does not need any content to be
        # changed it directly returns the correct data. Very fugly but the clock
        # is past midnight and I have to get up at 06:40 tomorrow.
        if isinstance(filename, basestring):
            return {'filename': filename}

        if filename.filename == '':
            raise RuntimeError, 'No file selected'
        return self.upload(slide, filename)

    def upload(self, slide, src):
        dst = open(slide.src_path(src.filename), 'wb')

        while True:
            chunk = src.file.read(8192)
            if not chunk: break
            dst.write(chunk)

        return {'filename': src.filename}

    def rasterize(self, slide, size, params):
        if isinstance(size, tuple):
            raise ValueError, 'omg'

        src = params['filename']
        args = [
            "convert", slide.src_path(src).encode('utf-8'),
            '-resize', str(size),
            '-background', 'black',
            '-gravity', 'center',
            '-extent', str(size),
            slide.raster_path(size)
        ]

        try:
            retcode = subprocess.call(args)
        except OSError, e:
            raise RuntimeError, 'Failed to run `%s`: %s' % (' '.join([pipes.quote(x) for x in args]), e)
        except:
            traceback.print_exc()
            print >> sys.stderr, 'When running', args
            return

        if retcode != 0:
            raise ValueError, 'failed to resample %s' % (slide.raster_path(size))

    def default_size(self, slide, params, width=None):
        src = params['filename']
        img = PythonMagick.Image(str(slide.src_path(src)))
        geom = img.size()
        size = Resolution(geom.width(), geom.height())

        if width:
            return size.scale(width=width)
        else:
            return size

    def title(self):
        return 'Image'

    def update(self, slide, current, file):
        return self.upload(slide, file)
