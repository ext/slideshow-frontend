import json
from slideshow.settings import Settings, ValidationError
import base

class ConfigurationHandlerV1(base.APIBase):
    exposed = True

    def GET(self):
        settings = Settings()
        return json.dumps(settings.all(), indent=2)

    @base.jsonbody
    def POST(self, **kwargs):
        errors = []
        settings = Settings()
        with settings:
            for group, fields in kwargs.iteritems():
                if group == 'Env':
                    try:
                        print group, fields
                        settings[group] = fields
                    except (ValidationError, ValueError) as e:
                        errors.append((key, str(e)))
                    continue

                for name, value in fields.iteritems():
                    key = '%s.%s' % (group, name)

                    # ignore database password unless something was entered
                    if key == 'Database.Password' and len(value) == 0: continue

                    try:
                        settings[key] = value
                    except (ValidationError, ValueError) as e:
                        errors.append((key, str(e)))

            if len(errors) == 0:
                settings.persist()
                return json.dumps({'success': True})
            else:
                return json.dumps({'success': False, 'errors': errors})
