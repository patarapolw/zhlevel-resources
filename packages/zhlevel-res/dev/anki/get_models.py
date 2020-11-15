from ankisync.anki import Anki
from ruamel import yaml

d = dict()
a = Anki()
d['1541040861255'] = a.model_by_id(1541040861255)
d['1541040860844'] = a.model_by_id(1541040860844)

with open('models.yaml', 'w') as f:
    yaml.safe_dump(d, f, allow_unicode=True)
