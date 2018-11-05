from ruamel import yaml
from zhlib.util import sort_vocab
import math


with open('hsk.yaml') as f_in, open('generated.yaml', 'a') as f_out:
    d = yaml.safe_load(f_in)
    d_out = dict()
    hsk_level = 6
    source = f'HSK{hsk_level}'
    vocab = sort_vocab(d[source])
    print(len(vocab))
    for i in range(0, 20):
        level = str(40 + i + 1)
        chuck = math.ceil(len(vocab) / 20)

        d_out.setdefault(level, list()).append({
            '_meta': {
                'source': source
            },
            'vocab': vocab[i*chuck: (i+1)*chuck]
        })
    yaml.safe_dump(d_out, f_out, allow_unicode=True)
