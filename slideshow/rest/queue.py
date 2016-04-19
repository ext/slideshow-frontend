import cherrypy
import json
from slideshow.lib import queue

class QueueHandlerV1(object):
    exposed = True

    def GET(self):
        c = cherrypy.thread_data.db
        return json.dumps([x.as_json() for x in queue.all(c)], indent=2)
