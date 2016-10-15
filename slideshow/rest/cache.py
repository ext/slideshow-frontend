import cherrypy
import json
import base
import slideshow.cache as cache
import slideshow.lib.slide as slide
from slideshow.settings import Settings

class CacheHandlerV1(base.APIBase):
    exposed = True

    def DELETE(self):
        db = cherrypy.thread_data.db
        slides = slide.all(db)
        resolution = Settings().resolution()
        try:
            cache.rebuild(slides, resolution)
            return json.dumps({'status': 'ok'})
        except Exception, e:
            return json.dumps({'status': 'error', 'error': str(e)})

    def PATCH(self):
        cache.rebuild_reset()
        return json.dumps({'status': 'ok'})
