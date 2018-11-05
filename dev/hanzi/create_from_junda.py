from ruamel import yaml
import regex


def purge_junda(d_out, current_level, current, last_i, i):
    d_out.setdefault('{:02d}'.format(current_level), list()).append({
        '_meta': {
            'source': 'Combined character frequency list of Classical and Modern Chinese'
                      '(http://lingua.mtsu.edu/chinese-computing/statistics/char/list.php?Which=TO)',
            'order': f'{last_i+1}-{i+1}'
        },
        'hanzi': ''.join(current)
    })


def read_junda(current_level=55):
    with open('spoonfed.txt') as f_in, open('generated.yaml', 'r+') as f_out, open('junda.txt') as junda:
        previous = list(set(regex.findall(r'\p{IsHan}', f_out.read())))
        f_out.seek(0)
        d_out = yaml.safe_load(f_out)

        current = list()
        last_i = None
        i = None

        for i, row in enumerate(junda):
            if i >= 3000:
                break

            hanzi = row.split('\t')[1]

            if hanzi in previous:
                continue

            previous.append(hanzi)

            if last_i is None:
                last_i = i

            current.append(hanzi)

            if len(current) > (483 / 6):
                purge_junda(d_out, current_level, current, last_i, i)

                current = list()
                last_i = None
                current_level += 1

        purge_junda(d_out, current_level, current, last_i, i)

        f_out.seek(0)
        yaml.safe_dump(d_out, f_out, allow_unicode=True)


if __name__ == '__main__':
    read_junda()
