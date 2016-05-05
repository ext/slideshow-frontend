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
        return self.semaphore.acquire(blocking)

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

    if thread is not None:
        raise RuntimeError('Rebuild already in progress')

    thread = _CacheRebuilder(slides, resolution)
    thread.start()

    _rebuild = thread
    return thread

def rebuild_reset():
    global _rebuild
    _rebuild = None
