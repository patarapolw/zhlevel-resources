from zhlib import zh

with open('spoonfed.txt', 'w') as f:
    for s in zh.Sentence.select().where(zh.Sentence.order.is_null(False)).order_by(zh.Sentence.order):
        f.write(s.sentence)
        f.write('\n')
