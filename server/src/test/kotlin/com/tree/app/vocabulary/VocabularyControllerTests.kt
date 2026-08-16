package com.tree.app.vocabulary

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class VocabularyControllerTests {
    private val reader = RecordingVocabularyReader()
    private val controller = VocabularyController(reader)

    @Test
    fun `passes validated search values to the repository`() {
        controller.words(
            search = "sight",
            level = "B1",
            status = "learning",
            partOfSpeech = "noun",
            language = "ru",
            includeNeedsReview = false,
            limit = 20,
            offset = 0,
        )

        assertEquals("sight", reader.lastQuery?.search)
        assertEquals("B1", reader.lastQuery?.level)
        assertEquals(20, reader.lastQuery?.limit)
    }

    @Test
    fun `rejects unsupported learning statuses`() {
        assertFailsWith<IllegalArgumentException> {
            controller.words(
                search = null,
                level = null,
                status = "unknown",
                partOfSpeech = null,
                language = "ru",
                includeNeedsReview = false,
                limit = 30,
                offset = 0,
            )
        }
    }
}

private class RecordingVocabularyReader : VocabularyReader {
    var lastQuery: WordSearchQuery? = null

    override fun checkHealth() = Unit

    override fun getStats() = StatsResponse(0, 0, emptyMap(), emptyMap(), emptyMap())

    override fun search(query: WordSearchQuery): WordsResponse {
        lastQuery = query
        return WordsResponse(emptyList(), 0, query.limit, query.offset)
    }

    override fun findById(id: Long, language: String): VocabularySenseResponse? = null
}
