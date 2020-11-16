package zhlevel.user

import org.bson.types.ObjectId
import java.util.*

data class CardEntry (
        var _id: ObjectId? = null,
        val noteId: ObjectId,
        var front: String? = null,
        var srsLevel: Int? = null,
        var nextReview: Date? = null,
        val modified: Date = Date(),
        val userId: ObjectId
)