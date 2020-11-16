package zhlevel.user

import org.bson.types.ObjectId
import java.util.*

data class NoteEntry (
        var _id: ObjectId? = null,
        val modified: Date = Date(),
        val userId: ObjectId,
        val type: String,
        val entry: String
) {
    val map = mapOf(
            "modified" to modified,
            "userId" to userId,
            "type" to type,
            "entry" to entry
    )
}