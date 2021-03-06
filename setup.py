from setuptools import setup, find_packages

setup(
    name = "slideshow",
    version = '0.4.0', # remember to bump 'configure.ac' and 'slideshow/templates/index.html' as well
    license = 'AGPL',
    author = 'David Sveningsson',
    author_email = 'ext@sidvind.com',

    packages = find_packages(),
    package_data = {
        '': [
            'install/*.sql',
            'lib/assembler/*.html',
            'static/js/*.js',
            'static/icon/*.png',
            'static/css/*.css',
            'static/css/*.png',
            'static/css/images/*.png',
            'templates/*.html',
            'templates/*/*.html',
            'settings.xml',
            'default.xml',
            'template.dtd',
            ]},

    entry_points = """
[console_scripts]
slideshow = slideshow.web:run
"""
)
