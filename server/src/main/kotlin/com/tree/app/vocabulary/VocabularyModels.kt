package com.tree.app.vocabulary

data class TranslationResponse(
    val language: String,
    val text: String,
)

data class VocabularySenseResponse(
    val id: String,
    val word: String,
    val definition: String?,
    val transcription: String?,
    val level: String,
    val reviewStatus: String,
    val status: String,
    val partsOfSpeech: List<String>,
    val translations: List<TranslationResponse>,
    val collocations: List<String>,
)

data class WordsResponse(
    val items: List<VocabularySenseResponse>,
    val total: Long,
    val limit: Int,
    val offset: Int,
)

data class StatsResponse(
    val senses: Long,
    val headwords: Long,
    val byLevel: Map<String, Long>,
    val byStatus: Map<String, Long>,
    val reconciliation: Map<String, Long>,
)

data class WordSearchQuery(
    val search: String?,
    val level: String?,
    val status: String?,
    val partOfSpeech: String?,
    val language: String,
    val includeNeedsReview: Boolean,
    val limit: Int,
    val offset: Int,
)

interface VocabularyReader {
    fun checkHealth()

    fun getStats(): StatsResponse

    fun search(query: WordSearchQuery): WordsResponse

    fun findById(id: Long, language: String): VocabularySenseResponse?
}

internal data class VocabularySenseRow(
    val id: Long,
    val word: String,
    val definition: String?,
    val transcription: String?,
    val level: String,
    val reviewStatus: String,
    val status: String,
    val total: Long,
)
