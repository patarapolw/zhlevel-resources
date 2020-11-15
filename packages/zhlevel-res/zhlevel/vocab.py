try:
    from importlib.resources import read_text
except ImportError:
    from importlib_resources import read_text

from ruamel import yaml
from wordfreq import word_frequency
import math


class VocabLevel:
    def __init__(self):
        self.data = dict()

        for lv, value in yaml.safe_load(read_text('zhlevel.data', 'vocab.yaml')).items():
            for v in value[0]['vocab']:
                self.data[v] = int(lv)

    def __getitem__(self, item):
        level = self.data.get(item, 60)

        if level is None:
            freq = word_frequency(item, 'zh')
            try:
                level = math.ceil(-10 * math.log10(freq)) - 30
                if level < 1:
                    level = 1
                elif level > 60:
                    level = None
            except ValueError:
                pass

        return level

    get = __getitem__
