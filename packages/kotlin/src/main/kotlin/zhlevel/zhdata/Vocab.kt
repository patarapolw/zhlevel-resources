package zhlevel.zhdata

import com.mongodb.client.model.Aggregates
import com.mongodb.client.model.Filters
import org.bson.Document
import org.bson.conversions.Bson
import org.bson.types.ObjectId
import java.util.regex.Pattern

class Vocab {
    private fun searchOne(s: String, col: String): Map<ObjectId, VocabEntry> {
        return Zhdata.vocab.find(Filters.regex(col, "(?i)" + Pattern.quote(s))).associateBy({it._id}, {it})
    }

    private fun searchNonChinese(s: String): List<VocabEntry> {
        val output = searchOne(s, "pinyin").toMutableMap()
        output.putAll(searchOne(s, "english"))

        return output.values.sortedBy { -it.frequency }
    }

    fun searchChinese(s: String): List<VocabEntry> {
        return Zhdata.vocab.find(Filters.or(listOf(
                Filters.regex("simplified", Pattern.quote(s)),
                Filters.regex("traditional", Pattern.quote(s))
        ))).sortedBy { -it.frequency }
    }

    fun searchChineseMatch(s: String): List<VocabEntry> {
        return Zhdata.vocab.find(Filters.or(listOf(
                Document("simplified", s),
                Document("traditional", s)
        ))).sortedBy { -it.frequency }
    }

    fun searchPinyin(s: String): List<VocabEntry> {
        return Zhdata.vocab.find(Filters.regex("pinyin", "(?i)" + Pattern.quote(s))).sortedBy { -it.frequency }
    }

    fun searchEnglish(s: String): List<VocabEntry> {
        return Zhdata.vocab.find(Filters.regex("english", "(?i)" + Pattern.quote(s))).sortedBy { -it.frequency }
    }

    operator fun get(s: String): List<VocabEntry> = when(Regex("\\p{IsHan}").find(s)) {
        null -> searchNonChinese(s)
        else -> searchChinese(s)
    }

    fun random(ls: List<String>? = null): VocabEntry? {
        val aggregate = mutableListOf<Bson>()
        val andCondition = mutableListOf(
                Filters.gt("frequency", 0)
        )

        if (!ls.isNullOrEmpty()) {
            val orCondition = mutableListOf<Bson>()

            ls.forEach { s ->
                orCondition.add(Filters.or(listOf(
                        Filters.regex("simplified", Pattern.quote(s)),
                        Filters.regex("traditional", Pattern.quote(s))
                )))
            }

            andCondition.add(Filters.or(orCondition))
        }

        aggregate.add(Aggregates.match(Filters.and(andCondition)))
        aggregate.add(Aggregates.sample(1))

        return Zhdata.vocab.aggregate(aggregate).firstOrNull()
    }
}