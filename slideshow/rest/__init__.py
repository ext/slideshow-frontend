from slideshow.rest.cache import *
from slideshow.rest.configuration import *
from slideshow.rest.queue import *
from slideshow.rest.status import *

class RESTHandlerV1(object):
    cache = CacheHandlerV1()
    configuration = ConfigurationHandlerV1()
    queue = QueueHandlerV1()
    status = StatusHandlerV1()
