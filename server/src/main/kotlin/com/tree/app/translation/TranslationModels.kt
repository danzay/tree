package com.tree.app.translation

data class TranslationLookupResponse(
    val definitions: List<TranslationDefinitionResponse>,
)

data class TranslationDefinitionResponse(
    val partOfSpeech: String?,
    val translations: List<String>,
)

interface TranslationReader {
    fun lookup(text: String): TranslationLookupResponse
}
