try:
    from importlib.resources import read_text
except ImportError:
    from importlib_resources import read_text

from ruamel import yaml
import regex


class HanziLevel:
    def __init__(self):
        self.data = dict()

        for lv, value in yaml.safe_load(read_text('zhlevel.data', 'hanzi.yaml')).items():
            for h in value[0]['hanzi']:
                self.data[h] = int(lv)

    def __getitem__(self, item):
        return self.vocab_level(item)

    get = __getitem__

    def vocab_level(self, vocab):
        return max(int(self.hanzi_level(h)) for h in regex.findall(r'\p{IsHan}', vocab))

    def hanzi_level(self, hanzi):
        return self.data.get(hanzi, 60)
