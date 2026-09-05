package com.tree.app.library

import com.tree.api.model.CefrLevel
import com.tree.api.model.LearningStatus
import kotlin.test.Test
import kotlin.test.assertEquals

class ArticleVocabularyMatcherTests {
    @Test
    fun `matches inflected verbs and keeps source offsets`() {
        val matcher = ArticleVocabularyMatcher(
            listOf(candidate(word = "to eat", normalizedWord = "to eat", level = "A1")),
        )

        val highlights = matcher.find("Everyone stopped eating meat.")

        assertEquals(1, highlights.size)
        assertEquals("eating", "Everyone stopped eating meat.".substring(highlights[0].start, highlights[0].end))
        assertEquals(CefrLevel.A1, highlights[0].level)
    }

    @Test
    fun `prefers a learning sense when a spelling has multiple eligible senses`() {
        val matcher = ArticleVocabularyMatcher(
            listOf(
                candidate(
                    word = "rise",
                    normalizedWord = "rise",
                    level = "A2",
                    status = "to_learn",
                ),
                candidate(word = "rise", normalizedWord = "rise", level = "B1", status = "learning"),
            ),
        )

        val highlight = matcher.find("Prices rise.").single()

        assertEquals(CefrLevel.B1, highlight.level)
        assertEquals(LearningStatus.learning, highlight.status)
    }

    @Test
    fun `matches the longest phrase without overlapping its words`() {
        val matcher = ArticleVocabularyMatcher(
            listOf(
                candidate(word = "in fact", normalizedWord = "in fact", level = "B1"),
                candidate(word = "fact", normalizedWord = "fact", level = "A2"),
            ),
        )

        val highlights = matcher.find("In fact, this works.")

        assertEquals(1, highlights.size)
        assertEquals("In fact", "In fact, this works.".substring(highlights[0].start, highlights[0].end))
    }

    @Test
    fun `matches C2 vocabulary`() {
        val matcher = ArticleVocabularyMatcher(
            listOf(candidate(word = "perspicacious", normalizedWord = "perspicacious", level = "C2")),
        )

        val highlight = matcher.find("A perspicacious observation.").single()

        assertEquals(CefrLevel.C2, highlight.level)
    }

    private fun candidate(
        word: String,
        normalizedWord: String,
        level: String,
        status: String = "to_learn",
    ) = VocabularyHighlightCandidate(
        senseId = 1,
        word = word,
        normalizedWord = normalizedWord,
        level = level,
        status = status,
    )
}
