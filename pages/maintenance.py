#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cherrypy
from lib import queue, slide, template
from settings import Settings
import daemon

class Ajax(object):
	@cherrypy.expose
	def log(self):
		return '<p>' + '<br/>\n'.join(daemon.log()) + '</p>'

class Handler(object):
	ajax = Ajax()
	
	@cherrypy.expose
	@template.output('maintenance/index.html', parent='maintenance')
	def index(self):
		cmd, args, env, cwd = daemon.settings()
		return template.render(log=daemon.log(), state=daemon.state(), cmd=cmd, args=args, env=env, cwd=cwd)

	@cherrypy.expose
	@template.output('maintenance/config.html', parent='maintenance')
	def config(self, action=None, **kwargs):
		settings = Settings('settings.xml', 'settings.json')
		
		if action == 'save':
			error = False
			
			# hack for environmental variables
			env = {}
			if 'Env' in kwargs:
				try:
					env = kwargs['Env'].split("\r\n")
					env = filter(lambda x: len(x) > 0, env)
					env = map(lambda x: tuple(x.split('=')), env)
					env = dict(env)
				except:
					raise ValueError, 'Malformed environment variables'
				finally:
					kwargs['Env'] = env
			
			for k,v in kwargs.items():
				try:
					settings[k] = v
				except ValueError as e:
					settings.item(k).message = str(e)
					error = True
			
			if not error:
				settings.persist()
				raise cherrypy.HTTPRedirect('/maintenance')
		
		return template.render(settings=settings)
	
	@cherrypy.expose(alias='start')
	def forcestart(self):
		daemon.start('', '')
		raise cherrypy.HTTPRedirect('/maintenance')
	
	@cherrypy.expose
	def start(self, resolution=None, fullscreen=True):
		daemon.start(resolution, fullscreen)
		raise cherrypy.HTTPRedirect('/maintenance')
	
	@cherrypy.expose
	def stop(self):
		daemon.stop()
		raise cherrypy.HTTPRedirect('/maintenance')
	
	@cherrypy.expose
	def ping(self):
		daemon.ipc.Ping()
		raise cherrypy.HTTPRedirect('/maintenance')
	
	@cherrypy.expose
	def dumpqueue(self):
		daemon.ipc.Debug_DumpQueue()
		raise cherrypy.HTTPRedirect('/maintenance')
