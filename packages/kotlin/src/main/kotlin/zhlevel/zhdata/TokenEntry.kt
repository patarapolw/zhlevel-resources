package zhlevel.zhdata

data class TokenEntry internal constructor (
        val entry: String,
        val sub: List<String> = listOf(),
        val `super`: List<String> = listOf(),
        val variant: List<String> = listOf(),
        val frequency: Float?
)