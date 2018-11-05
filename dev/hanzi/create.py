from ruamel import yaml

last_chap = 1
d_out = dict()
used = set()
i = 0


def purge_chapters(chap_no, all_current):
    global last_chap, i, used, d_out

    i += 1
    print(chap_no, len(used))
    d_out.setdefault(str(i), list()).append({
        '_meta': {
            'source': '初级汉语（泰语)',
            'chapters': f'{last_chap}-{chap_no}'
        },
        'hanzi': ''.join(all_current)
    })
    last_chap = chap_no + 1


def main():
    all_current = list()

    with open('reference.yaml') as f_in, open('generated.yaml', 'w') as f_out:
        d = yaml.safe_load(f_in)
        chap_no = 0

        for book_no, c1 in d['初级汉语'].items():
            for chap_no, c2 in c1.items():
                current = []
                for h in c2['hanzi']:
                    if h not in used:
                        current.append(h)
                        used.add(h)
                all_current += current

                if len(used) // 65 > i:
                    purge_chapters(chap_no, all_current)
                    all_current = list()

        purge_chapters(chap_no, all_current)

        yaml.safe_dump(d_out, f_out, allow_unicode=True)


if __name__ == '__main__':
    main()
