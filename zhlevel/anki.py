import mistune
from ankisync.anki import Anki
from ankisync.presets import get_wanki_min_dconf
from zhlib import zh
from wordfreq import word_frequency

from .hanzi import HanziLevel
from .vocab import VocabLevel

markdown = mistune.Markdown()
deck_conf = get_wanki_min_dconf()


class ZhSync:
    MODEL_HANZI = 'zhlevel_hanzi'
    MODEL_VOCAB = 'zhlevel_vocab'

    HANZI_A_FORMAT = markdown('''
    # {{hanzi}}
    ---
    ## {{pinyin}}

    ### {{meaning}}

    Junda: {{junda}}

    Heisig: {{heisig}}

    #### Vocab
    {{vocabs}}

    #### Sentence
    {{sentences}}
    ''')

    VOCAB_A_FORMAT = markdown('''
    # {{simplified}}
    ---
    ## {{pinyin}}

    ### {{english}}

    Traditional: {{traditional}}

    Frequency: {{frequency}}

    #### Sentence
    {{sentences}}
    ''')

    LABELS = [
        '01-10 Pleasant',
        '11-20 Painful',
        '21-30 Death',
        '31-40 Hell',
        '41-50 Paradise',
        '51-60 Reality'
    ]

    def __init__(self):
        self.anki = Anki()
        self.h_level = HanziLevel()
        self.v_level = VocabLevel()

        m_dict = self.anki.model_names_and_ids()

        self.m_hanzi_id = m_dict.get(self.MODEL_HANZI)
        if self.m_hanzi_id is None:
            self.m_hanzi_id = self.anki.add_model(
                name=self.MODEL_HANZI,
                fields=[
                    'hanzi',    # The two fields of the question side must be firsts in order.
                    'meaning',  # This too.
                    'pinyin',
                    'heisig',
                    'kanji',
                    'junda',
                    'vocabs',
                    'sentences',
                    'note'
                ],
                templates={
                    '中英': (markdown('# Hanzi: {{hanzi}}'), self.HANZI_A_FORMAT),
                    '英中': (markdown('# Hanzi meaning: {{meaning}}'), self.HANZI_A_FORMAT),
                    '字迹': (markdown('# Hanzi writing: {{meaning}}'), self.HANZI_A_FORMAT)
                }
            )

        self.m_vocab_id = m_dict.get(self.MODEL_VOCAB)
        if self.m_vocab_id is None:
            self.m_vocab_id = self.anki.add_model(
                name=self.MODEL_VOCAB,
                fields=[
                    'simplified',  # The two fields of the question side must be firsts in order.
                    'english',  # This too.
                    'frequency',
                    'traditional',
                    'pinyin',
                    'sentences',
                    'note'
                ],
                templates={
                    '中英': (markdown('# Vocab: {{hanzi}}'), self.VOCAB_A_FORMAT),
                    '英中': (markdown('# Vocab meaning: {{meaning}}'), self.VOCAB_A_FORMAT),
                    # '字迹': (markdown('# Vocab writing: {{meaning}}'), VOCAB_A_FORMAT)
                }
            )

    def add_hanzi(self, hanzi):
        db_h = zh.Hanzi.get_or_none(hanzi=hanzi)
        if db_h:
            h_dict = dict(db_h)
            h_dict.update({
                'vocabs': markdown('\n'.join(f'- {v}' for v in h_dict['vocabs'])),
                'sentences': markdown('\n'.join(f'- {s}' for s in h_dict['sentences'])),
            })
        else:
            h_dict = {
                'hanzi': hanzi
            }

        card_ids = self.anki.note_to_cards(self.anki.add_note({
            'modelName': 'zhlevel_hanzi',
            'deckId': 1,
            'fields': h_dict
        }))

        level = self.h_level[hanzi]
        label = self.LABELS[(int(level)-1) // 10]

        self.anki.change_deck(card_ids['中英'],
                              deck_name=f'ZhLevel::Hanzi::{label}::Level {level}::中英',
                              dconf=deck_conf['id'])
        self.anki.change_deck(card_ids['英中'],
                              deck_name=f'ZhLevel::Hanzi::{label}::Level {level}::英中',
                              dconf=deck_conf['id'])
        self.anki.change_deck(card_ids['字迹'],
                              deck_name=f'ZhLevel::Hanzi::{label}::Level {level}::字迹',
                              dconf=deck_conf['id'])

    def add_vocab(self, vocab):
        db_vs = zh.Vocab.match(vocab)
        if len(db_vs) > 0:
            db_v = db_vs[0]
            v_dict = dict(db_v)
            v_dict.update({
                'sentences': markdown('\n'.join(f'- {s}' for s in v_dict['sentences'])),
            })
        else:
            v_dict = {
                'simplified': vocab
            }
        v_dict['frequency'] = word_frequency(vocab, 'zh') * 10**6

        card_ids = self.anki.note_to_cards(self.anki.add_note({
            'modelName': 'zhlevel_vocab',
            'deckId': 1,
            'fields': v_dict
        }))

        level = self.v_level[vocab]
        label = self.LABELS[(int(level) - 1) // 10]

        self.anki.change_deck(card_ids['英中'],
                              deck_name=f'ZhLevel::Vocab::{label}::Level {level:02d}::英中',
                              dconf=deck_conf['id'])

        level = self.h_level[vocab]
        label = self.LABELS[(int(level) - 1) // 10]
        self.anki.change_deck(card_ids['中英'],
                              deck_name=f'ZhLevel::Vocab::{label}::Level {level:02d}::中英',
                              dconf=deck_conf['id'])
