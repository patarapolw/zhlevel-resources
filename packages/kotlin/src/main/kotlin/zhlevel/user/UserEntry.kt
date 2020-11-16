package zhlevel.user

import org.bson.types.ObjectId

data class UserEntry (
        val _id: ObjectId? = null,
        val email: String
)