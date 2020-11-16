package zhlevel.user

import com.mongodb.client.MongoCollection
import zhlevel.Config


object User {
    private val db = Config.mongoClient.getDatabase("user")

    val user: MongoCollection<UserEntry> = db.getCollection("user", UserEntry::class.java)
    val note: MongoCollection<NoteEntry> = db.getCollection("note", NoteEntry::class.java)
    val card: MongoCollection<CardEntry> = db.getCollection("card", CardEntry::class.java)
}