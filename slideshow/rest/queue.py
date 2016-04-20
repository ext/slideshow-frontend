import cherrypy
import json
from slideshow.lib import queue
import base

class QueueHandlerV1(base.APIBase):
    exposed = True

    def GET(self):
        c = cherrypy.thread_data.db
        return json.dumps([x.as_json() for x in queue.all(c)], indent=2)

    @base.jsonbody
    def POST(self, name):
        c = cherrypy.thread_data.db
        item = queue.add(c, name)
        cherrypy.thread_data.db.commit()
        return json.dumps(item.as_json(), indent=2)
