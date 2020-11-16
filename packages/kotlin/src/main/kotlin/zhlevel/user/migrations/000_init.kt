package zhlevel.user.migrations

import com.mongodb.client.model.IndexOptions
import org.bson.Document
import zhlevel.user.User

fun main() {
    User.user.createIndex(Document("email", 1), IndexOptions().unique(true))
    User.note.createIndex(Document(mapOf(
            "userId" to 1,
            "type" to 1,
            "entry" to 1
    )), IndexOptions().unique(true))

    User.card.createIndex(Document(mapOf(
            "userId" to 1,
            "front" to 1
    )), IndexOptions().unique(true))
}