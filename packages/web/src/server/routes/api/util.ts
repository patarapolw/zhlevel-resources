import { ObjectID } from "bson";
import Database from "../../db/Database";
import { Request } from "express";

export async function getUserId(req: Request): Promise<ObjectID> {
    const user = req.user;
    const email = process.env.DEFAULT_USER;
    if (!user && !email) { throw new Error("User not found"); }

    const db = new Database();
    const dbUser = await db.user.findOne({email: (email || user.emails[0].value)});
    if (!dbUser || !dbUser._id) { throw new Error("User not found"); }

    return dbUser._id;
}
