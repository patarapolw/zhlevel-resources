package zhlevel

import com.mongodb.MongoClientURI
import io.github.cdimascio.dotenv.dotenv
import org.litote.kmongo.KMongo

object Config {
    val env = dotenv()
    val mongoClient = KMongo.createClient(MongoClientURI(env["MONGODB_URI"]!!))
}