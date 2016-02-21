#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cherrypy, urllib, os
import traceback
import json
import itertools
from slideshow.lib import assembler, queue, slide, template
from slideshow.lib.resolution import Resolution
from slideshow.settings import Settings
import slideshow.daemon as daemon
from cherrypy.lib.static import serve_file

class QueueHandlerV1(object):
    exposed = True

    def GET(self):
        c = cherrypy.thread_data.db
        return json.dumps([x.as_json() for x in queue.all(c)], indent=2)

class HandlerV1(object):
    exposed = True

    def __init__(self):
        self.queue = QueueHandlerV1()
