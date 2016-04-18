import cherrypy
import json
from functools import wraps

class APIBase(object):
    def postbody(self):
        length = cherrypy.request.headers['Content-Length']
        return cherrypy.request.body.read(int(length))

def jsonbody(func):
    @wraps(func)
    def inner(self, **kwargs):
        data = self.postbody()
        contenttype = cherrypy.request.headers['Content-Type'].split(';', 1)[0]
        if contenttype == 'application/json':
            kwargs.update(json.loads(data))
        return func(self, **kwargs)
    return inner
