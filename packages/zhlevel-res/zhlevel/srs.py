from srs_format import api as srs_api
from zhlib import zh
import jieba
import regex
from ruamel import yaml
from wordfreq import word_frequency

try:
    from importlib.resources import read_text
except ImportError:
    from  importlib_resources import read_text

from .hanzi import HanziLevel
from .vocab import VocabLevel
from .util import progress_bar


class SrsSync:
    MODEL_HANZI = 'zhlevel_hanzi'
    MODEL_VOCAB = 'zhlevel_vocab'

    LABELS = [
        '01-10 Pleasant',
        '11-20 Painful',
        '21-30 Death',
        '31-40 Hell',
        '41-50 Paradise',
        '51-60 Reality'
    ]

    def __init__(self, filename):
        srs_api.init(filename, create=True)

        self.h_level = HanziLevel()
        self.v_level = VocabLevel()

        self.h_model = srs_api.find_model(name=self.MODEL_HANZI)
        if self.h_model is None:
            self.h_model = srs_api.create_model(
                name=self.MODEL_HANZI,
                key_fields=['hanzi'],
                templates=[
                    dict(
                        name='中英',
                        front='# Hanzi: {{hanzi}}'
                    ),
                    dict(
                        name='英中',
                        front='# Hanzi meaning: {{meaning}}'
                    ),
                    dict(
                        name='字迹',
                        front='# Hanzi writing: {{meaning}}'
                    )
                ]
            )

        self.v_model = srs_api.find_model(name=self.MODEL_VOCAB)
        if self.v_model is None:
            self.v_model = srs_api.create_model(
                name='zhlevel_vocab',
                key_fields=['simplified'],
                templates=[
                    dict(
                        name='中英',
                        front='# Vocab: {{simplified}}'
                    ),
                    dict(
                        name='英中',
                        front='# Vocab meaning: {{english}}'
                    )
                ]
            )

    def add_hanzi(self, hanzi, tags=None):
        srs_notes = srs_api.find_notes(hanzi=hanzi)

        if len(srs_notes) == 0:
            db_h = zh.Hanzi.get_or_none(hanzi=hanzi)
            if db_h:
                data = dict(db_h)
            else:
                data = {
                    'hanzi': hanzi
                }

            srs_note = srs_api.create_note(
                model=self.h_model,
                data=data
            )

            level = self.h_level[hanzi]
            label = self.LABELS[(int(level) - 1) // 10]

            for srs_card in srs_note.cards:
                srs_card.add_deck(f'ZhLevel::'
                                  f'Hanzi::'
                                  f'{srs_card.template.name}::'
                                  f'{label}::'
                                  f'Level {int(level):02d}')

            srs_notes = [srs_note]

        if tags:
            srs_api.notes_add_tags(srs_notes, tags)

        return srs_notes

    def add_vocab(self, vocab, tags=None):
        srs_notes = srs_api.find_notes(simplified=vocab)

        if len(srs_notes) == 0:
            db_v = zh.Vocab.get_or_none(simplified=vocab)
            if db_v:
                data = dict(db_v)
            else:
                data = {
                    'simplified': vocab
                }

            data['frequency'] = word_frequency(vocab, 'zh') * 10 ** 6

            srs_note = srs_api.create_note(
                model=self.v_model,
                data=data
            )

            for srs_card in srs_note.cards:
                if srs_card.template.name == '中英':
                    level = self.h_level[vocab]
                    label = self.LABELS[(int(level) - 1) // 10]
                else:
                    level = self.v_level[vocab]
                    label = self.LABELS[(int(level) - 1) // 10]

                srs_card.add_deck(f'ZhLevel::'
                                  f'Vocab::'
                                  f'{srs_card.template.name}::'
                                  f'{label}::'
                                  f'Level {int(level):02d}')

        if tags:
            srs_api.notes_add_tags(srs_notes, tags)

        return srs_notes

    def add_text(self, text, tags=None):
        hanzis = [h for h in regex.findall(r'\p{IsHan}', text)]
        vocabs = [v for v in jieba.cut_for_search(text) if regex.search(r'\p{IsHan}', v)]

        srs_notes = sum([self.add_hanzi(h) for h in progress_bar(hanzis, desc='hanzi')], [])
        srs_notes += sum([self.add_vocab(v) for v in progress_bar(vocabs, desc='vocab')], [])

        if tags:
            srs_api.notes_add_tags(srs_notes, tags)

        return srs_notes

    def create_hsk(self):
        h = yaml.safe_load(read_text('zhlevel.data', 'hanzi.yaml'))
        v = yaml.safe_load(read_text('zhlevel.data', 'vocab.yaml'))

        for i in progress_bar(range(60)):
            level = '{:02d}'.format(i + 1)
            for hanzi in h[level][0]['hanzi']:
                self.add_hanzi(hanzi)

            for vocab in v[level][0]['vocab']:
                self.add_vocab(vocab)
