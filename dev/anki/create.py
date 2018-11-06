from ankisync.apkg import Apkg
from ankisync.presets import get_wanki_min_dconf
from zhlib import zh
import mistune
from ruamel import yaml
from tqdm import tqdm
from wordfreq import word_frequency

from zhlevel.hanzi import HanziLevel

markdown = mistune.Markdown()
deck_conf = get_wanki_min_dconf()

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


def create_apkg(filename='zhlevel.apkg'):
    with open('../hanzi/generated.yaml') as f:
        h = yaml.safe_load(f)

    with open('../vocab/generated.yaml') as f:
        v = yaml.safe_load(f)

    with Apkg(filename) as anki:
        anki.init(
            first_model={
                'name': 'zhlevel_hanzi',
                'fields': [
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
                'templates': {
                    '中英': (markdown('# Hanzi: {{hanzi}}'), HANZI_A_FORMAT),
                    '英中': (markdown('# Hanzi meaning: {{meaning}}'), HANZI_A_FORMAT),
                    '字迹': (markdown('# Hanzi writing: {{meaning}}'), HANZI_A_FORMAT)
                }
            },
            first_deck='ZhLevel',
            first_dconf=deck_conf,
            first_note_data=False
        )

        anki.add_model(
            name='zhlevel_vocab',
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
                '中英': (markdown('# Vocab: {{hanzi}}'), VOCAB_A_FORMAT),
                '英中': (markdown('# Vocab meaning: {{english}}'), VOCAB_A_FORMAT),
                # '字迹': (markdown('# Vocab writing: {{english}}'), VOCAB_A_FORMAT)
            }
        )

        v_ce_level = dict()
        h_level_finder = HanziLevel()

        for i in tqdm(range(60)):
            level = '{:02d}'.format(i + 1)
            label = LABELS[i // 10]

            h_list = h[level][0]['hanzi']
            ce_ids = set()
            ec_ids = set()
            writing_ids = set()

            for hanzi in h_list:
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

                card_ids = anki.note_to_cards(anki.add_note({
                    'modelName': 'zhlevel_hanzi',
                    'deckId': 1,
                    'fields': h_dict
                }))

                ce_ids.add(card_ids['中英'])
                ec_ids.add(card_ids['英中'])
                writing_ids.add(card_ids['字迹'])

            anki.change_deck(ce_ids, deck_name=f'ZhLevel::Hanzi::{label}::Level {level}::中英', dconf=deck_conf['id'])
            anki.change_deck(ec_ids, deck_name=f'ZhLevel::Hanzi::{label}::Level {level}::英中', dconf=deck_conf['id'])
            anki.change_deck(writing_ids, deck_name=f'ZhLevel::Hanzi::{label}::Level {level}::字迹', dconf=deck_conf['id'])

            v_list = v[level][0]['vocab']
            v_ec_ids = set()

            for vocab in v_list:
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

                card_ids = anki.note_to_cards(anki.add_note({
                    'modelName': 'zhlevel_vocab',
                    'deckId': 1,
                    'fields': v_dict
                }))

                v_ec_ids.add(card_ids['英中'])
                v_ce_level.setdefault(h_level_finder[vocab], set()).add(card_ids['中英'])

            anki.change_deck(v_ec_ids, deck_name=f'ZhLevel::Vocab::{label}::Level {level}::英中', dconf=deck_conf['id'])

        for level, id_list in v_ce_level.items():
            label = LABELS[(int(level)-1)// 10]
            anki.change_deck(id_list, deck_name=f'ZhLevel::Vocab::{label}::Level {level:02d}::中英', dconf=deck_conf['id'])


if __name__ == '__main__':
    create_apkg()
