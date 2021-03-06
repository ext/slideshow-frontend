import os, sys, re
import MySQLdb
import cherrypy
import traceback
from slideshow.lib.browser import Browser, register, on_install
from slideshow.settings import Settings
from MySQLdb.cursors import DictCursor
from MySQLdb.constants import CR

strip_comment = re.compile(r'--.*\n')

# This hack "enables" using ? and :name as placeholders (MySQLdb.paramstyle is 'format', not 'qmark')
class QCursor(DictCursor):
    replace = [
        (re.compile(r':([A-Za-z0-9]+)'), r'%(\1)s'),
        (re.compile(r'\s+'), ' '),
        (re.compile(r'DATETIME\(([^\)]*)\)'), r"DATE_FORMAT(\1, GET_FORMAT(DATETIME,'ISO'))"), # have to use GET_FORMAT instead of % since % is used as placeholders
    ]

    def execute(self, query, args=None):
        query = query.replace('?', '%s').strip()
        for pattern, sub in QCursor.replace:
            query = re.sub(pattern, sub, query)

        if False:
            cherrypy.engine.log('Query: "%s" %s' % (query, args))
        return DictCursor.execute(self, query, args)

@register('mysql')
@on_install('mysql.sql')
class MySQL(Browser):
    def __init__(self, *args, **kwargs):
        Browser.__init__(self, *args, **kwargs)

        self.real_connect()

        # check if not previous database is created
        self.execute("SELECT `table_name` FROM `information_schema`.`tables` WHERE `table_schema` = ? and table_name = 'slide'", (self.database,))
        if self.fetchone() is None:
            self.install()
    
    def real_connect(self):
        self.conn = MySQLdb.connect(
            host = self.hostname,
            user = self.username,
            passwd = self.password,
            db = self.database,
            cursorclass=QCursor)
        self.cursor = self.conn.cursor()
        self.conn.autocommit(1)

    def fetchone(self):
        return self.cursor.fetchone()

    def fetchall(self):
        return self.cursor.fetchall()

    def execute(self, *args, **kwargs):
        try:
            self.cursor.execute(*args, **kwargs)
        except MySQLdb.OperationalError, e:
            code, msg = e.args
            if code != CR.SERVER_GONE_ERROR:
                raise
            
            cherrypy.engine.log('OperationalError: %s (will try to reconnect)' % msg)
            self.real_connect()
            self.cursor.execute(*args, **kwargs)
            
        return self # to allow chaining

    def executemany(self, *args, **kwargs):
        try:
            self.cursor.executemany(*args, **kwargs)
        except MySQLdb.OperationalError, e:
            code, msg = e.args
            if code != CR.SERVER_GONE_ERROR:
                raise

            cherrypy.engine.log('OperationalError: %s (will try to reconnect)' % msg)
            self.real_connect()
            self.cursor.executemany(*args, **kwargs)

        return self # to allow chaining

    def executescript(self, lines):
        global strip_comment
        for line in lines.split(';'):
            line = strip_comment.sub('', line).strip()
            if line == '': continue
            self.execute(line)

    def last_row_id(self):
        return self.conn.insert_id()

    def transaction(self):
        self.conn.autocommit(0)
    
    def commit(self):
        self.conn.commit()
        self.conn.autocommit(1)

    def rollback(self):
        self.conn.rollback()
        self.conn.autocommit(1)
    
    def connect(self, *args):
        """ Called by threads go get a thread-local copy of database """
        cherrypy.thread_data.db = MySQL(self.hostname, self.username, self.password, self.database)
