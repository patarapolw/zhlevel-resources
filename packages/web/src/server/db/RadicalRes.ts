import Database, { IToken } from "./Database";

export default class RadicalRes {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    public async search(s: string): Promise<IToken> {
        const output = await this.db.token.findOne({entry: s});
        if (!output) {
            throw new Error(`Search Radical ${s} not found`);
        }

        return output;
    }

    public async random(): Promise<IToken> {
        return (await this.db.token.aggregate([
            {$match: {$or: [
                {sub: {$exists: true}},
                {super: {$exists: true}},
                {variant: {$exists: true}}
            ]}},
            {$sample: {size: 1}}
        ]).toArray())[0];
    }
}
