package zhlevel.zhdata

import org.junit.jupiter.api.DynamicTest
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestFactory

class VocabTest {
    private val vocab = Vocab()

    @TestFactory
    fun testSearchChinese() = listOf(
            "你们"
    ).map { input ->
        DynamicTest.dynamicTest("Searching $input as Chinese") {
            println(vocab.searchChinese(input))
        }
    }

    @TestFactory
    fun testSearchChineseMatch() = listOf(
            "你们"
    ).map { input ->
        DynamicTest.dynamicTest("Searching $input as Chinese") {
            println(vocab.searchChineseMatch(input))
        }
    }

    @TestFactory
    fun testSearchPinyin() = listOf(
            "zhong1 wen2"
    ).map { input ->
        DynamicTest.dynamicTest("Searching $input as Pinyin") {
            println(vocab.searchPinyin(input))
        }
    }

    @TestFactory
    fun testSearchEnglish() = listOf(
            "English"
    ).map { input ->
        DynamicTest.dynamicTest("Searching $input as English") {
            println(vocab.searchEnglish(input).filterIndexed { index, _ -> index < 5 })
        }
    }

    @TestFactory
    fun testSearch() = listOf(
            "你们",
            "zhong1 wen2",
            "English"
    ).map { input ->
        DynamicTest.dynamicTest("Searching $input as any") {
            println(vocab[input].filterIndexed { index, _ -> index < 5 })
        }
    }

    @Test
    fun testRandom() {
        println(vocab.random())
    }

    @TestFactory
    fun testRandomMany() = listOf(
            listOf("爱", "你", "中")
    ).map { input ->
        DynamicTest.dynamicTest("Random $input") {
            println(vocab.random(input))
        }
    }
}