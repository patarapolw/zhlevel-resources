package zhlevel.user

import org.bson.Document
import org.bson.types.ObjectId
import org.litote.kmongo.deleteOneById
import org.litote.kmongo.findOneById
import org.litote.kmongo.updateOneById
import java.sql.Timestamp
import java.time.Duration
import java.util.*

object CardApi {
    private val srs = mapOf(
            1 to Duration.ofMinutes(10),
            2 to Duration.ofHours(4),
            3 to Duration.ofHours(8),
            4 to Duration.ofDays(1),
            5 to Duration.ofDays(3),
            6 to Duration.ofDays(7),
            7 to Duration.ofDays(14),
            8 to Duration.ofDays(28),
            9 to Duration.ofDays(112)
    )

    fun delete(id: ObjectId): Boolean {
        return User.card.deleteOneById(id).deletedCount > 0
    }

    fun getAll(): List<CardEntry> {
        return User.card.find().toList()
    }

    fun get(id: ObjectId): CardEntry? {
        return User.card.findOneById(id)
    }

    fun markRight(id: ObjectId): Boolean {
        return get(id)?.let { current ->
            current.srsLevel = when(current.srsLevel) {
                null -> 1
                in 1..9 -> current.srsLevel!! + 1
                else -> current.srsLevel
            }

            if (current.srsLevel!! < 10) {
                val calendar = Calendar.getInstance()
                current.nextReview?.let {
                    calendar.time = it
                }
                calendar.add(Calendar.HOUR, srs[current.srsLevel!!]?.toHours()?.toInt() ?: 24)
                current.nextReview = Timestamp.from(calendar.toInstant())
            } else {
                current.nextReview = null
            }

            User.card.updateOneById(id,
                    Document("\$set", Document(mapOf(
                            "srsLevel" to current.srsLevel,
                            "nextReview" to current.nextReview
                    )))).modifiedCount > 0
        } ?: false
    }

    fun markWrong(id: ObjectId): Boolean {
        return get(id)?.let { current ->
            current.srsLevel = when(current.srsLevel) {
                in 1..10 -> current.srsLevel!! - 1
                else -> 0
            }

            val calendar = Calendar.getInstance()
            calendar.add(Calendar.HOUR, 4)
            current.nextReview = Timestamp.from(calendar.toInstant())

            User.card.updateOneById(id,
                    Document("\$set", Document(mapOf(
                            "srsLevel" to current.srsLevel,
                            "nextReview" to current.nextReview
                    )))).modifiedCount > 0
        } ?: false
    }
}