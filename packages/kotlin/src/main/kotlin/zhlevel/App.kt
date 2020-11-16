package zhlevel

import com.google.gson.Gson
import com.huaban.analysis.jieba.JiebaSegmenter
import spark.Filter
import spark.Spark
import spark.kotlin.*
import zhlevel.user.NoteApi
import zhlevel.zhdata.Radical
import zhlevel.zhdata.Sentence
import zhlevel.zhdata.Vocab

class App {
    private val gson = Gson()

    private data class EntryRequest (
            val entry: String? = null,
            val entries: List<String>? = null,
            val type: String? = null,
            val email: String? = null,
            val note: String? = null,
            val id: Int? = null
    )

    private val radical = Radical()
    private val vocab = Vocab()
    private val sentence = Sentence()
    private val jieba = JiebaSegmenter()

    private val frontendPort = Config.env["TS_PORT"] ?: "5000"
    private val corsHeaders = mapOf(
            "Access-Control-Allow-Origin" to "http://localhost:$frontendPort",
            "Access-Control-Allow-Methods" to "*",
            "Access-Control-Allow-Headers" to "Content-Type,Authorization,X-Requested-With,Content-Length,Accept,Origin,",
            "Access-Control-Allow-Credentials" to "true"
    )

    private fun applyCors() {
        Spark.after(Filter { _, response ->
            corsHeaders.forEach { k, v -> response.header(k, v) }
        })
    }

    fun serve(_port: Int) {
        staticFiles.location("/public")
        port(_port)
        applyCors()

        Spark.path("/api") {
            Spark.path("/vocab") {
                post("/") {
                    val entryRequest = gson.fromJson(this.request.body(), EntryRequest::class.java)
                    entryRequest.entries?.let { entries ->
                        gson.toJson(entries.flatMap { vocab[it].filterIndexed { i, _ -> i < 10 } }.distinctBy { it._id })
                    } ?: entryRequest.entry?.let { entry ->
                        gson.toJson(vocab[entry].filterIndexed { i, _ -> i < 10 })
                    } ?: this.response.status(404)
                }

                post("/match") {
                    val entryRequest = gson.fromJson(this.request.body(), EntryRequest::class.java)
                    entryRequest.entries?.let { entries ->
                        gson.toJson(entries.flatMap { vocab.searchChineseMatch(it) })
                    } ?: entryRequest.entry?.let { entry ->
                        gson.toJson(vocab.searchChineseMatch(entry))
                    } ?: this.response.status(404)
                }

                post("/random") {
                    val entryRequest = gson.fromJson(this.request.body(), EntryRequest::class.java)

                    vocab.random(entryRequest.entries)?.let { gson.toJson(it)} ?: this.response.status(404)
                }
            }

            Spark.path("/radical") {
                post("/") {
                    val entryRequest = gson.fromJson(this.request.body(), EntryRequest::class.java)
                    entryRequest.entry ?.let { gson.toJson(radical[it]) } ?: this.response.status(404)
                }
            }

            Spark.path("/sentence") {
                post("/") {
                    val entryRequest = gson.fromJson(this.request.body(), EntryRequest::class.java)
                    entryRequest.entry?.let { gson.toJson(sentence[it].filterIndexed { i, _ -> i < 10 }) }
                            ?: this.response.status(404)
                }

                post("/random") {
                    val entryRequest = gson.fromJson(this.request.body(), EntryRequest::class.java)

                    gson.toJson(sentence.random(entryRequest.entries))
                }
            }

            Spark.path("/user") {
                Spark.path("/note") {
                    post("/check") {
                        val entryRequest = gson.fromJson(this.request.body(), EntryRequest::class.java)

                        if (entryRequest.entry != null && entryRequest.type != null && entryRequest.email != null) {
                            gson.toJson(mapOf(
                                    "isInDatabase" to NoteApi.check(
                                            email = entryRequest.email,
                                            type = entryRequest.type,
                                            entry = entryRequest.entry
                                    )
                            ))
                        } else {
                            this.response.status(404)
                        }
                    }

                    delete("/") {
                        val entryRequest = gson.fromJson(this.request.body(), EntryRequest::class.java)

                        if (entryRequest.entry != null && entryRequest.type != null && entryRequest.email != null) {
                            val deleteCount = NoteApi.delete(
                                    email = entryRequest.email,
                                    type = entryRequest.type,
                                    entry = entryRequest.entry
                            )

                            if (deleteCount) this.response.status(201) else this.response.status(404)
                        } else {
                            this.response.status(404)
                        }
                    }

                    put("/") {
                        val entryRequest = gson.fromJson(this.request.body(), EntryRequest::class.java)

                        if (entryRequest.entry != null && entryRequest.type != null
                                && entryRequest.email != null) {
                            NoteApi.put(
                                    email = entryRequest.email,
                                    type = entryRequest.type,
                                    entry = entryRequest.entry
                            )

                            this.response.status(201)
                        } else {
                            this.response.status(404)
                        }
                    }

                    post("/") {
                        val entryRequest = gson.fromJson(this.request.body(), EntryRequest::class.java)

                        if (entryRequest.entry != null && entryRequest.type != null && entryRequest.email != null) {
                            NoteApi.get(
                                    email = entryRequest.email,
                                    type = entryRequest.type,
                                    entry = entryRequest.entry
                            )?.let { gson.toJson(it) } ?: this.response.status(404)
                        } else {
                            this.response.status(404)
                        }
                    }
                }
            }

            Spark.path("/jieba") {
                post("/") {
                    val entryRequest = gson.fromJson(this.request.body(), EntryRequest::class.java)
                    entryRequest.entry?.let { gson.toJson(jieba.sentenceProcess(it).map { segment ->
                        mapOf(
                                "word" to segment
                        )
                    }) } ?: this.response.status(404)
                }
            }
        }
    }
}

fun main() {
    println(App().serve((Config.env["PORT"] ?: System.getenv("PORT") ?: "8080").toInt()))
}
