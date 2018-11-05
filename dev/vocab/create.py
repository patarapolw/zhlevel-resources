from ruamel import yaml
import regex


with open('hsk.yaml') as f_in, open('generated.yaml', 'w') as f_out, open('../hanzi/generated.yaml') as h_rule:
    d = yaml.safe_load(f_in)
    rule = yaml.safe_load(h_rule)

    d_out = dict()

    prev = None
    used = set()

    for i in range(60):
        level = '{:02d}'.format(i+1)
        allowed_hanzi = rule[level][0]['hanzi']

        if i < 5:
            hsk = 1
            no_vocab = 30
        elif i < 10:
            hsk = 2
            no_vocab = 30
        elif i < 20:
            hsk = 3
            no_vocab = 30
        elif i < 30:
            hsk = 4
            no_vocab = 60
        elif i < 40:
            hsk = 5
            no_vocab = 130
        else:
            hsk = 6
            no_vocab = 125

        source = f'HSK{hsk}'
        v_list = d[source]

        current_vocab = set()
        for vocab in v_list:
            if vocab not in used:
                if all(h in allowed_hanzi for h in regex.findall(r'\p{IsHan}', vocab)):
                    current_vocab.add(vocab)
                    if len(current_vocab) >= no_vocab:
                        break
                used.add(vocab)

        v_list = [v for v in v_list if v not in current_vocab]

        if len(current_vocab) < no_vocab:
            limit = no_vocab - len(current_vocab)
            for x, vocab in enumerate(v_list):
                if x < limit:
                    current_vocab.add(vocab)
                    used.add(vocab)
                else:
                    break

        v_list = [v for v in v_list if v not in current_vocab]

        d[source] = v_list

        d_out.setdefault(level, list()).append({
            '_meta': {
                'source': source
            },
            'vocab': list(current_vocab)
        })

    yaml.safe_dump(d_out, f_out, allow_unicode=True)
