from slideshow.rest.queue import *
from slideshow.rest.status import *

class RESTHandlerV1(object):
    queue = QueueHandlerV1()
    status = StatusHandlerV1()
