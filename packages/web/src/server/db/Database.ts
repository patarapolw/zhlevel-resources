import { MongoClient, Db, Collection, ObjectID } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

export const mongoClient = new MongoClient(process.env.MONGO_URI!, { useNewUrlParser: true });

export interface ISentence {
    _id?: ObjectID;
    chinese: string;
    pinyin: string;
    english: string;
}

export interface IUserSentence {
    _id?: ObjectID;
    userId: ObjectID;
    chinese: string;
    pinyin: string;
    english?: string;
}

export interface IToken {
    _id?: ObjectID;
    entry: string;
    frequency?: number;
    sub: string[];
    super: string[];
    variant: string[];
}

export interface IVocab {
    _id?: ObjectID;
    simplified: string;
    traditional?: string;
    pinyin: string;
    english: string;
    frequency?: number;
}

export interface IUserVocab {
    _id?: ObjectID;
    userId: ObjectID;
    simplified: string;
    traditional?: string;
    pinyin: string;
    english?: string;
    frequency?: number;
}

export interface IUser {
    _id?: ObjectID;
    email: string;
}

export interface ICard {
    _id?: ObjectID;
    userId: ObjectID;
    noteId: ObjectID;
    deckId?: ObjectID;
    front: string;
    back?: string;
    mnemonic: string;
    srsLevel: number;
    nextReview: Date;
}

export interface INote {
    _id?: ObjectID;
    userId: ObjectID;
    type: string;
    entry: string;
    modified: Date;
    tags?: string[];
}

export interface IDeck {
    _id?: ObjectID;
    userId: ObjectID;
    name: string;
}

export interface ILevel {
    _id?: ObjectID;
    entry: string;
    level: number;
    tag?: string[];
}

export default class Database {
    public sentence: Collection<ISentence>;
    public token: Collection<IToken>;
    public vocab: Collection<IVocab>;

    public user: Collection<IUser>;
    public card: Collection<ICard>;
    public note: Collection<INote>;
    public deck: Collection<IDeck>;
    public userSentence: Collection<IUserSentence>;
    public userVocab: Collection<IUserVocab>;

    public lvHanzi: Collection<ILevel>;
    public lvVocab: Collection<ILevel>;

    private dbZhdata: Db;
    private dbUser: Db;
    private dbZhlevel: Db;

    constructor() {
        this.dbZhdata = mongoClient.db("zhdata");
        this.dbUser = mongoClient.db("user");
        this.dbZhlevel = mongoClient.db("zhlevel");

        this.sentence = this.dbZhdata.collection("sentence");
        this.token = this.dbZhdata.collection("token");
        this.vocab = this.dbZhdata.collection("vocab");

        this.user = this.dbUser.collection("user");
        this.card = this.dbUser.collection("card");
        this.note = this.dbUser.collection("note");
        this.deck = this.dbUser.collection("deck");
        this.userSentence = this.dbUser.collection("sentence");
        this.userVocab = this.dbUser.collection("vocab");

        this.lvHanzi = this.dbZhlevel.collection("hanzi");
        this.lvVocab = this.dbZhlevel.collection("vocab");
    }
}
