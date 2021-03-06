#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os

import cherrypy
from genshi.core import Stream
from genshi.output import encode, get_serializer
from genshi.template import Context, TemplateLoader
from genshi.filters import Translator, Transformer
from genshi.filters.transform import StreamBuffer
import gettext
import slideshow.daemon as daemon

#trans = gettext.GNUTranslations(open("po/sv.mo"))

def template_loaded(template):
	pass
    #template.filters.insert(0, Translator(trans.ugettext))
#    template.filters.insert(0, Translator(trans.ugettext))

loader = TemplateLoader(
    os.path.join(os.path.dirname(__file__), '..', 'templates'),
    auto_reload=True,
    callback=template_loaded
)

def output(filename, method='xhtml', encoding='utf-8', doctype=None, parent='main', loader=loader, **options):
    """Decorator for exposed methods to specify what template they should use
    for rendering, and which serialization method and options should be
    applied.
    """
    def decorate(func):
        def wrapper(*args, **kwargs):
            cherrypy.thread_data.template = loader.load(filename)
            cherrypy.thread_data.parent = parent
            opt = options.copy()

            # if no doctype is set, try to autodetect
            # if doctype is False, skip doctype
            # if doctype is set, use it
            if doctype is None:
                if method == 'html':
                    opt.setdefault('doctype', 'html')
                if method == 'xhtml':
                    opt.setdefault('doctype', 'xhtml')
            elif doctype is not False:
                opt.setdefault('doctype', doctype)

            serializer = get_serializer(method, **opt)
            stream = func(*args, **kwargs)

            if not isinstance(stream, Stream):
                return stream
            return encode(serializer(stream), method=serializer,
                          encoding=encoding)
        return wrapper
    return decorate

def flash():
    # convert flash severity to classes
    flash_severity = {
        'error': 'danger'
    }
    return [(flash_severity.get(i[0], i[0]), i[1]) for i in cherrypy.session.pop('flash', [])]

def assemblers():
    """Get a list of available assemblers"""
    from slideshow.lib import assembler

    # get all available assemblers
    available = assembler.all()

    # manually place image and text first
    result = [available.pop('text'), available.pop('image')]

    # sort the rest alphabetically
    result += sorted(available.itervalues())

    return result


def render(*args, **kwargs):
    """Function to render the given data to the template specified via the
    ``@output`` decorator.
    """

    if args:
        assert len(args) == 1, \
            'Expected exactly one argument, but got %r' % (args,)
        template = loader.load(args[0])
    else:
        template = cherrypy.thread_data.template

    ctxt = Context(url=cherrypy.url)
    ctxt.push(kwargs)
    ctxt['parent'] = cherrypy.thread_data.parent
    ctxt['daemon'] = daemon.state()
    ctxt['daemonstr'] = daemon.statename(daemon.state())
    ctxt['username'] = cherrypy.request.login
    ctxt['flash'] = flash()
    ctxt['assemblers'] = assemblers()

    ctxt['_'] = lambda x: x # trans.ugettext

    return template.generate(ctxt)
