package zhlevel.zhdata

import org.junit.jupiter.api.DynamicTest
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestFactory

class RadicalTest {
    private val radical = Radical()

    @TestFactory
    fun testRadicalFinder() = listOf(
            "你",
            "好",
            "你好"
    ).map { input ->
        DynamicTest.dynamicTest("Radical of $input") {
            println(radical[input])
        }
    }

    @Test
    fun testRandom() {
        println(radical.random())
    }

    @TestFactory
    fun testRandomMany() = listOf(
            listOf("爱", "你", "中")
    ).map { input ->
        DynamicTest.dynamicTest("Random $input") {
            println(radical.random(input))
        }
    }
}