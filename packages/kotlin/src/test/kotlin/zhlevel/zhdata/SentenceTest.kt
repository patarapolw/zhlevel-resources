package zhlevel.zhdata

import org.junit.jupiter.api.DynamicTest
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestFactory

class SentenceTest {
    private val sentence = Sentence()

    @TestFactory
    fun testSearchChinese() = listOf(
            "你好",
            "中文"
    ).map { input ->
        DynamicTest.dynamicTest("Search for $input") {
            println(sentence[input])
        }
    }

    @Test
    fun testRandom() {
        println(sentence.random())
    }

    @TestFactory
    fun testRandomMany() = listOf(
            listOf("爱", "你", "中")
    ).map { input ->
        DynamicTest.dynamicTest("Random $input") {
            println(sentence.random(input))
        }
    }
}