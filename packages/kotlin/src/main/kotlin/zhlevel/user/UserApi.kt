package zhlevel.user

import org.bson.Document
import org.bson.types.ObjectId
import org.litote.kmongo.findOne

object UserApi {
    fun getIdByEmail(email: String): ObjectId {
        return User.user.findOne(Document("email", email))?._id ?: let {
            val userEntry = UserEntry(email = email)
            User.user.insertOne(userEntry)
            userEntry._id!!
        }
    }
}