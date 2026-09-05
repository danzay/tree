package com.tree.app.vocabulary

import com.tree.api.model.StatsResponse
import com.tree.api.model.VocabularySenseResponse
import com.tree.api.model.WordsResponse
import java.util.UUID

data class WordSearchQuery(
    val search: String?,
    val level: String?,
    val status: String?,
    val partOfSpeech: String?,
    val language: String,
    val limit: Int,
    val offset: Int,
)

interface VocabularyReader {
    fun checkHealth()

    fun getStats(userId: UUID): StatsResponse

    fun search(userId: UUID, query: WordSearchQuery): WordsResponse

    fun findById(userId: UUID, id: Long, language: String): VocabularySenseResponse?
}

interface VocabularyWriter {
    fun updateStatus(
        userId: UUID,
        id: Long,
        status: String,
        language: String,
    ): VocabularySenseResponse?
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
