import unittest
import threading
import slideshow.cache as cache

timeout = 5

class SlideMock(object):
    def __init__(self):
        self.rebuilt = False
        self.flag = threading.Event()

    def release(self):
        self.flag.set()

    def rebuild_cache(self, resolution):
        if not self.flag.wait(timeout):
            raise RuntimeError('Timed out')
        self.rebuilt = True

class CacheRebuildTest(unittest.TestCase):
    def tearDown(self):
        cache.rebuild_reset(force=True)

    def test_initial_state(self):
        self.assertIsNone(cache.status())

    def test_call_rebuild_cache(self):
        slides = [SlideMock()]
        self.assertIsNone(cache.status())
        thread = cache.rebuild(slides, (800,600))

        for s in slides: s.release()
        thread.join(timeout)
        self.assertFalse(thread.isAlive())
        self.assertTrue(slides[0].rebuilt)

    def test_progress(self):
        slides = [SlideMock(), SlideMock(), SlideMock()]
        self.assertIsNone(cache.status())
        thread = cache.rebuild(slides, (800,600))

        status = cache.status()
        self.assertIsNotNone(status)
        self.assertEqual(status['value'], 0)
        self.assertEqual(status['max'], 3)

        for i, slide in enumerate(slides):
            slide.release()
            thread.sync()
            self.assertTrue(slide.rebuilt)

            status = cache.status()
            self.assertIsNotNone(status)
            self.assertEqual(status['value'], i + 1)
            self.assertEqual(status['max'], 3)

    def test_no_double_rebuild(self):
        slides = [SlideMock()]
        try:
            cache.rebuild(slides, (800,600))
            self.assertRaises(RuntimeError, cache.rebuild, [], (800,600))
        finally:
            slides[0].release()

    def test_rebuild_after_reset(self):
        thread = cache.rebuild([], (800,600))
        cache.rebuild_reset()
        cache.rebuild([], (800,600))

    def test_no_reset_in_progress(self):
        slides = [SlideMock()]
        try:
            cache.rebuild(slides, (800,600))
            self.assertRaises(RuntimeError, cache.rebuild_reset)
        finally:
            slides[0].release()
