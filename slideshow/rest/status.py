import json
import slideshow.cache as cache
import slideshow.daemon as daemon
import base

class StatusHandlerV1(base.APIBase):
    exposed = True

    def GET(self):
        state = daemon.state()
        return json.dumps({
            'state': {
                'value': state,
                'name': daemon.statename(state),
            },
            'cache': cache.status(),
        })
