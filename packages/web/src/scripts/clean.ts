import Database, { mongoClient } from "../server/db/Database";

(async () => {
    await mongoClient.connect();

    const db = new Database();

    const emptyIds = await db.card.aggregate([
        {$group: {
            _id: {
                userId: "$userId",
                noteId: "$noteId"
            },
            uniqueIds: {$addToSet: "$_id"},
            count: {$sum: 1}
        }},
        {$match: {count: {$gt: 1}}},
        {$sort: {count: -1}}
    ]).toArray();

    console.log(emptyIds);

    // await db.card.deleteMany({
    //     _id: {$in: emptyIds.map((el) => el._id!)}
    // });

    mongoClient.close();
})();
