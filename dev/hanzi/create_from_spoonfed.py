from ruamel import yaml
import regex


def purge_spoon_fed(d_out, current, i, last_i, current_level):
    d_out.setdefault('{:02d}'.format(current_level), list()).append({
        '_meta': {
            'source': 'Chinese Sentences and audio, spoon fed (https://ankiweb.net/shared/info/867291675)',
            'order': f'{last_i+1}-{i+1}'
        },
        'hanzi': ''.join(current)
    })


def read_spoon_fed(current_level=6):
    with open('spoonfed.txt') as f_in, open('generated.yaml', 'r+') as f_out:
        previous = list(set(regex.findall(r'\p{IsHan}', f_out.read())))
        f_out.seek(0)
        d_out = yaml.safe_load(f_out)
        current = list()
        last_i = 0
        i = 0

        for i, row in enumerate(f_in):
            clean_sentence = list(set(h for h in regex.findall(r'\p{IsHan}', row) if h not in (previous + current)))
            if len(clean_sentence) == 0 and len(current) == 0:
                last_i = i
                continue

            current += clean_sentence

            if len(current) > 50:
                purge_spoon_fed(d_out, current, i, last_i, current_level)

                previous += current
                current = list()
                current_level += 1
                last_i = i

        purge_spoon_fed(d_out, current, i, last_i, current_level)

        f_out.seek(0)
        yaml.safe_dump(d_out, f_out, allow_unicode=True)


if __name__ == '__main__':
    read_spoon_fed()
