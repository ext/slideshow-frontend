from slideshow.rest.configuration import *
from slideshow.rest.queue import *
from slideshow.rest.status import *

class RESTHandlerV1(object):
    configuration = ConfigurationHandlerV1()
    queue = QueueHandlerV1()
    status = StatusHandlerV1()
