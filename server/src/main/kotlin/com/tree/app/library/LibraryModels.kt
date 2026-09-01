package com.tree.app.library

import java.util.UUID

data class LibraryItemQuery(
    val search: String?,
    val type: String?,
)

data class LibraryItemSummaryResponse(
    val id: Long,
    val slug: String,
    val title: String,
    val type: String,
    val summary: String,
    val topic: String,
    val coverImagePath: String,
    val estimatedReadMinutes: Int,
    val vocabularyCount: Int,
    val readingStatus: String,
    val youtubeVideoId: String?,
    val lastOpenedAt: String?,
    val updatedAt: String,
)

data class ArticleBlockResponse(
    val position: Int,
    val type: String,
    val text: String,
    val highlights: List<ArticleHighlightResponse>,
)

data class ArticleHighlightResponse(
    val start: Int,
    val end: Int,
    val senseId: Long,
    val word: String,
    val level: String,
    val status: String,
)

data class LibraryItemDetailResponse(
    val item: LibraryItemSummaryResponse,
    val blocks: List<ArticleBlockResponse>,
)

interface LibraryReader {
    fun list(userId: UUID, query: LibraryItemQuery): List<LibraryItemSummaryResponse>

    fun findById(userId: UUID, id: Long): LibraryItemDetailResponse?
}
