#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os, sys
import cherrypy
import sqlite3
import re
import argparse
import traceback

import slideshow
from slideshow.lib import template, browser as browser_factory
from slideshow.pages import slides
from slideshow.pages import maintenance
from slideshow.pages import queue
from slideshow.settings import Settings
import slideshow.daemon as daemon

def get_resource_path(*path):
	return os.path.join(os.path.dirname(slideshow.__file__), *path)

class Root(object):
	slides = slides.Handler()
	maintenance = maintenance.Handler()
	queue = queue.Handler()
	
	@cherrypy.expose
	def index(self):
		raise cherrypy.InternalRedirect('/slides/list')

def install(dst, config_file):
	from os.path import isdir, join, exists

	# ensure path is a directory
	if not isdir(dst):
		print >> sys.stderr, 'Must point to a directory, not', dst
		return 1

	for x in ['image', 'video', 'tmp']:
		os.mkdir(join(dst, x))

	if not config_file:
		config_file = join(dst, 'settings.conf')

	# check if config already exists
	if exists(config_file):
		print >> sys.stderr, 'Configuration already exists, cannot install a new one.'
		print >> sys.stderr, 'If you intend to replace the configuration, please remove the old one first, e.g. `rm %s\'' % config_file
		return 1

	# put a dummy config, will be overwritten later
	try:
		with open(config_file, 'w') as f:
			f.write("{}\n")
	except IOError:
		print >> sys.stderr, 'Failed to install configuration at', args.config_file
		print >> sys.stderr, 'Ensure that you have write-permission to the specified location.'
		return 1

	# load default settings
	settings = Settings()
	settings.load(get_resource_path('settings.xml'), config_file=None, format_keys=dict(basepath=dst))
			
	# store the directory we installed to
	with settings:
		settings['Path.BasePath'] = os.path.abspath(dst)

	settings.persist(dst=config_file)
	print >> sys.stderr, 'Configuration installed, restart without --install flag to continue.'
	return 0

def run():
	# setup argument parser
	parser = argparse.ArgumentParser(description='Slideshow frontend')
	parser.add_argument('-f', '--config-file')
	parser.add_argument('-v', '--verbose', dest='verbose', action='store_true')
	parser.add_argument('-q', '--quiet', dest='verbose', action='store_false')
	parser.add_argument('-p', '--port', type=int, default=8000)
	parser.add_argument('--install', default=None)

	# parse args
	args = parser.parse_args()

	try:
		# create new config if we are bootstraping
		if args.install:
			rc = install(args.install, args.config_file)
			sys.exit(rc)

		# verify that config_file exists
		if not os.path.exists(args.config_file):
			print >> sys.stderr, 'Could not open configuration file:', args.config_file
			print >> sys.stderr, 'You can create a new configuration by adding the --install flag or creating the file yourself.'
			print >> sys.stderr, 'Note that the file must be writable by the user running slideshow.'
			sys.exit(1)

		# verify that config_file is writable
		if not os.access(args.config_file, os.W_OK):
			print >> sys.stderr, 'Could not write to configuration file:', args.config_file
			print >> sys.stderr, 'Make sure the user has proper permissions.'
			sys.exit(1)

		# load slideshow settings
		settings = Settings()
		settings.load(get_resource_path('settings.xml'), config_file=args.config_file, format_keys=dict(basepath=os.path.split(args.config_file)[0]))

		# read cherrypy config
		config = settings['cherrypy']

		# cherrypy only accepts str, not unicode
		for k,v in config.items():
			if isinstance(v, basestring):
				config[k] = str(v)

		# load browser
		browser = browser_factory.from_settings(settings)

		# make all worker threads connect to the database
		cherrypy.engine.subscribe('start_thread', browser.connect)

		# load application config
		application = cherrypy.tree.mount(Root(), '/')
		application.config.update({
			'/': {
				'tools.staticdir.root': os.path.dirname(os.path.abspath(__file__)),
				'tools.gzip.on': True,
				'tools.encode.on': True,
				'tools.encode.encoding': 'utf8',
				},
			'/static': {
				'tools.staticdir.on': True,
				'tools.staticdir.dir': '../static',
				},
			})

		# add password-protection if available
		passwd = os.path.join(settings['Path.BasePath'], 'users')
		if os.path.exists(passwd):
			application.config['/'].update({
				'tools.auth_digest.on': True,
				'tools.auth_digest.realm': 'slideshow',
				'tools.auth_digest.get_ha1': cherrypy.lib.auth_digest.get_ha1_file_htdigest(passwd),
				'tools.auth_digest.key': None,
			})
	
		# cherrypy site config
		cherrypy.config.update({
				'sessionFilter.on': True,
				'server.socket_host': "0.0.0.0", 
				'server.socket_port': args.port
			})
		cherrypy.config.update(config)
	
		# initiate daemon instance
		daemon.initiate(cherrypy.engine, browser)
	
		# start cherrypy
		if hasattr(cherrypy.engine, 'block'):
			# 3.1 syntax
			cherrypy.engine.start()
			cherrypy.engine.block()
		else:
			# 3.0 syntax
			cherrypy.server.quickstart()
			cherrypy.engine.start()

	except Exception, e: # don't leak any exceptions
		if args.verbose:
			traceback.print_exc()
		else:
			print >> sys.stderr, e
		
		# if this is reached the application crashed
		sys.exit(1)
		
if __name__ == '__main__':
	run(*sys.argv[1:])
