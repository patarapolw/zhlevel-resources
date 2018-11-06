# 中文Level

Trying to figure out, if I had to separate Chinese into 6x10 = 60 levels, just like https://www.wanikani.com, how would I do it?

My current answer is, follow the textbooks and HSK, and sometimes, [wordfreq](https://github.com/LuminosoInsight/wordfreq) and [junda](http://lingua.mtsu.edu/chinese-computing/statistics/char/list.php?Which=TO) (but secondarily).

See my current answer [here](/current).

I have compiled to Anki file (`*.apkg`) [here](/zhlevel.apkg).

## Features of Anki file

- Learn Hanzi in Textbook/[Sentence-learning](https://ankiweb.net/shared/info/867291675) order. Only if both of the following not available, sort Hanzi by frequency according to [Junda](http://lingua.mtsu.edu/chinese-computing/statistics/char/list.php?Which=TO).
- Learn Vocab on EN->ZH regardless of whether you know the Hanzi or not, but prioritize the Hanzi you know first (if the vocab does not exceed the HSK level you are supposed to know.)
- Learn Vocab on ZH->EN only if you have already know the Hanzi (that is, Hanzi in this level, or in previous levels).

## Adding custom vocab

- Vocabularies, probably broken down jia [jieba](https://github.com/fxsjy/jieba), can be added to Anki deck / default profile, [via this script](/zhlevel/anki.py).
