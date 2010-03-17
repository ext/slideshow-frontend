#ifndef SDLBACKEND_H
#define SDLBACKEND_H

#include "backend/platform.h"
#include <SDL/SDL.h>

class SDLBackend:public PlatformBackend {
	public:
		SDLBackend();
		virtual ~SDLBackend();

		virtual int init(const Vector2ui &resolution);
		virtual void cleanup();

		virtual void poll();

		virtual void swap_buffers() const;

		virtual void lock_mouse(bool state);

	private:
		bool _lock;
};

#endif /* SDLBACKEND_H */
