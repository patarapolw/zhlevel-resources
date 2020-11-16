package zhlevel.zhdata

import org.bson.types.ObjectId

data class VocabEntry internal constructor (
        val _id: ObjectId,
        val simplified: String,
        val traditional: String?,
        val pinyin: String,
        val english: String,
        val frequency: Float = 0f
)