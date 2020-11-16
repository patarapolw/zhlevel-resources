package zhlevel.zhdata

import com.mongodb.client.MongoCollection
import zhlevel.Config

object Zhdata {
    private val db = Config.mongoClient.getDatabase("zhdata")

    val vocab: MongoCollection<VocabEntry> = db.getCollection("vocab", VocabEntry::class.java)
    val token: MongoCollection<TokenEntry> = db.getCollection("token", TokenEntry::class.java)
    val sentence: MongoCollection<SentenceEntry> = db.getCollection("sentence", SentenceEntry::class.java)
}