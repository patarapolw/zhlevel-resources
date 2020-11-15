from zhlib import zh

text = '''
kua4 guo2
gua1 guo3
hua2 luo4
guo2 hua4
luo4 hua1
zuo4 hua4
shuo1 hua4
shua1 guo1
hua1 duo3
tuo1 kua3
zhua1 cuo4
huo3 hua4
'''

for pinyin in text.strip().split('\n'):
    print(list(zh.Vocab.search_pinyin(pinyin)))
