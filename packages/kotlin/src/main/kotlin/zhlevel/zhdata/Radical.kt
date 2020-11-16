package zhlevel.zhdata

import com.mongodb.client.model.Aggregates
import com.mongodb.client.model.Filters
import org.bson.Document
import org.bson.conversions.Bson

class Radical {
    operator fun get(c: String): TokenEntry? {
        return Zhdata.token.find(Document("entry", c)).firstOrNull()
    }

    fun random(ls: List<String>? = null): TokenEntry? {
        val aggregate = mutableListOf<Bson>()
        val andCondition = mutableListOf(
                Filters.or(listOf(
                        Filters.exists("sub"),
                        Filters.exists("super"),
                        Filters.exists("variant")
                ))
        )

        if (!ls.isNullOrEmpty()) {
            val orCondition = mutableListOf<Bson>()

            ls.forEach { s ->
                orCondition.add(Document("entry", s))
            }

            andCondition.add(Filters.or(orCondition))
        }

        aggregate.add(Aggregates.match(Filters.and(andCondition)))
        aggregate.add(Aggregates.sample(1))

        return Zhdata.token.aggregate(aggregate).firstOrNull()
    }
}