import threading
import traceback
from slideshow.settings import Settings

_rebuild = None

class _CacheRebuilder(threading.Thread):
    def __init__(self, slides, resolution):
        threading.Thread.__init__(self)
        self.slides = slides
        self.resolution = resolution
        self.progress = 0
        self.error = False
        self.semaphore = threading.Semaphore(0)

    def sync(self, blocking=True):
        if self.error is not False:
            return False
        return self.semaphore.acquire(blocking)

    def finished(self):
        return self.progress == len(self.slides) or self.error is not False

    def run(self):
        try:
            for n, slide in enumerate(self.slides):
                slide.rebuild_cache(self.resolution)
                self.progress = n + 1
                self.semaphore.release()
        except:
            traceback.print_exc()
            self.error = traceback.format_exc()

def status():
    global _rebuild
    thread = _rebuild

    if thread is None:
        return None

    if thread.error is not False:
        return {'error': thread.error}

    return {
        'value': thread.progress,
        'max':   len(thread.slides),
    }

def rebuild(slides, resolution):
    global _rebuild
    thread = _rebuild

    if not (thread is None or thread.finished()):
        raise RuntimeError('Rebuild already in progress')

    thread = _CacheRebuilder(slides, resolution)
    thread.start()

    _rebuild = thread
    return thread

def rebuild_reset(force=False):
    global _rebuild
    thread = _rebuild

    if force is True or thread is None:
        _rebuild = None
        return

    if not thread.finished():
        raise RuntimeError('Cannot reset while rebuild is in progress')

    _rebuild = None
