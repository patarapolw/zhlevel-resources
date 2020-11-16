package zhlevel.user

import com.mongodb.client.model.UpdateOptions
import org.bson.Document
import org.litote.kmongo.findOne

object NoteApi {
    fun check(email: String, type: String, entry: String): Boolean {
        return get(email, type, entry) != null
    }

    fun delete(email: String, type: String, entry: String): Boolean {
        return User.note.deleteOne(Document(mapOf(
                "userId" to UserApi.getIdByEmail(email),
                "type" to type,
                "entry" to entry
        ))).deletedCount > 0
    }

    fun put(email: String, type: String, entry: String): Boolean {
        val userId = UserApi.getIdByEmail(email)
        return User.note.updateOne(
                Document(mapOf(
                        "userId" to userId,
                        "type" to type,
                        "entry" to entry
                )),
                Document("\$set", Document(NoteEntry(
                        userId = userId,
                        type = type,
                        entry = entry
                ).map)),
                UpdateOptions().upsert(true)).modifiedCount > 0
    }

    fun get(email: String, type: String, entry: String): NoteEntry? {
        return User.note.findOne(Document(mapOf(
                "userId" to UserApi.getIdByEmail(email),
                "type" to type,
                "entry" to entry
        )))
    }
}