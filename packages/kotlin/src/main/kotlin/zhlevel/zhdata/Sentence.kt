package zhlevel.zhdata

import com.mongodb.client.model.Aggregates
import com.mongodb.client.model.Filters
import org.bson.conversions.Bson
import java.util.regex.Pattern

class Sentence {
    operator fun get(s: String): List<SentenceEntry> {
        return Zhdata.sentence.find(Filters.regex("chinese", Pattern.quote(s))).toList()
    }

    fun random(ls: List<String>? = null): SentenceEntry? {
        val aggregate = mutableListOf<Bson>()

        if (!ls.isNullOrEmpty()) {
            val orCondition = mutableListOf<Bson>()

            ls.forEach { s ->
                orCondition.add(Filters.regex("chinese", Pattern.quote(s)))
            }

            aggregate.add(Aggregates.match(Filters.or(orCondition)))
        }

        aggregate.add(Aggregates.sample(5))

        return Zhdata.sentence.aggregate(aggregate).firstOrNull()
    }
}