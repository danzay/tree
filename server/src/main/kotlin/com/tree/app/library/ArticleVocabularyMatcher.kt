package com.tree.app.library

import com.tree.api.model.ArticleHighlightResponse
import com.tree.api.model.CefrLevel
import com.tree.api.model.LearningStatus
import java.text.Normalizer
import java.util.Locale

data class VocabularyHighlightCandidate(
    val senseId: Long,
    val word: String,
    val normalizedWord: String,
    val level: String,
    val status: String,
)

class ArticleVocabularyMatcher(
    candidates: List<VocabularyHighlightCandidate>,
) {
    private val candidatesByPhrase = buildCandidateIndex(candidates)
    private val longestPhrase = candidatesByPhrase.keys.maxOfOrNull { phrase ->
        phrase.count { character -> character == WORD_SEPARATOR } + 1
    } ?: 1

    fun find(text: String): List<ArticleHighlightResponse> {
        val tokens = WORD_REGEX.findAll(text).map { match ->
            ArticleToken(
                text = match.value,
                normalized = normalize(match.value),
                start = match.range.first,
                end = match.range.last + 1,
            )
        }.toList()
        val highlights = mutableListOf<ArticleHighlightResponse>()
        var tokenIndex = 0

        while (tokenIndex < tokens.size) {
            val phraseMatch = findPhraseMatch(text, tokens, tokenIndex)
            if (phraseMatch != null) {
                highlights += phraseMatch.highlight
                tokenIndex += phraseMatch.tokenCount
                continue
            }

            val token = tokens[tokenIndex]
            val candidate = tokenCandidates(token.normalized)
                .firstNotNullOfOrNull { normalized -> candidatesByPhrase[normalized] }
            if (candidate != null) {
                highlights += candidate.toHighlight(token.start, token.end)
            }
            tokenIndex += 1
        }

        return highlights
    }

    private fun findPhraseMatch(
        source: String,
        tokens: List<ArticleToken>,
        startIndex: Int,
    ): PhraseMatch? {
        val maximumLength = minOf(longestPhrase, tokens.size - startIndex)

        for (tokenCount in maximumLength downTo 2) {
            val phraseTokens = tokens.subList(startIndex, startIndex + tokenCount)
            if (!hasPhraseSeparators(source, phraseTokens)) {
                continue
            }

            val phrase = phraseTokens.joinToString(WORD_SEPARATOR.toString()) { token -> token.normalized }
            val candidate = candidatesByPhrase[phrase] ?: continue
            val firstToken = phraseTokens.first()
            val lastToken = phraseTokens.last()
            return PhraseMatch(
                highlight = candidate.toHighlight(firstToken.start, lastToken.end),
                tokenCount = tokenCount,
            )
        }

        return null
    }

    private fun hasPhraseSeparators(source: String, tokens: List<ArticleToken>): Boolean {
        return tokens.zipWithNext().all { (first, second) ->
            val separator = source.substring(first.end, second.start)
            separator.matches(PHRASE_SEPARATOR_REGEX)
        }
    }

    private fun tokenCandidates(token: String): List<String> {
        val candidates = linkedSetOf(token)
        IRREGULAR_LEMMAS[token]?.let(candidates::add)

        if (token.endsWith("ies") && token.length > 3) {
            candidates += token.dropLast(3) + "y"
        }
        if (token.endsWith("ing") && token.length > 4) {
            val stem = token.dropLast(3)
            candidates += stem
            candidates += stem + "e"
            candidates += removeDoubledFinalConsonant(stem)
        }
        if (token.endsWith("ied") && token.length > 3) {
            candidates += token.dropLast(3) + "y"
        } else if (token.endsWith("ed") && token.length > 3) {
            val stem = token.dropLast(2)
            candidates += stem
            candidates += stem + "e"
            candidates += removeDoubledFinalConsonant(stem)
        }
        if (token.endsWith("es") && token.length > 3) {
            candidates += token.dropLast(2)
        }
        if (token.endsWith("s") && !token.endsWith("ss") && token.length > 2) {
            candidates += token.dropLast(1)
        }

        return candidates.flatMap { candidate ->
            listOf(candidate, "to $candidate", "(to) $candidate")
        }
    }

    private fun removeDoubledFinalConsonant(stem: String): String {
        if (stem.length < 2 || stem.last() != stem[stem.lastIndex - 1]) {
            return stem
        }

        return stem.dropLast(1)
    }

    private fun buildCandidateIndex(
        candidates: List<VocabularyHighlightCandidate>,
    ): Map<String, VocabularyHighlightCandidate> {
        val sortedCandidates = candidates.sortedWith(
            compareBy<VocabularyHighlightCandidate>(
                { candidate -> if (candidate.status == LEARNING_STATUS) 0 else 1 },
                { candidate -> CEFR_LEVELS.indexOf(candidate.level) },
                VocabularyHighlightCandidate::senseId,
            ),
        )
        val index = linkedMapOf<String, VocabularyHighlightCandidate>()

        sortedCandidates.forEach { candidate ->
            val normalizedWord = normalize(candidate.normalizedWord)
            index.putIfAbsent(normalizedWord, candidate)
            VERB_PREFIXES.firstOrNull(normalizedWord::startsWith)?.let { prefix ->
                index.putIfAbsent(normalizedWord.removePrefix(prefix), candidate)
            }
        }

        return index
    }

    private fun VocabularyHighlightCandidate.toHighlight(
        start: Int,
        end: Int,
    ) = ArticleHighlightResponse(
        start = start,
        end = end,
        senseId = senseId,
        word = word,
        level = CefrLevel.forValue(level),
        status = LearningStatus.forValue(status),
    )

    private fun normalize(value: String): String =
        Normalizer.normalize(value, Normalizer.Form.NFKC)
            .trim()
            .lowercase(Locale.ENGLISH)

    private data class ArticleToken(
        val text: String,
        val normalized: String,
        val start: Int,
        val end: Int,
    )

    private data class PhraseMatch(
        val highlight: ArticleHighlightResponse,
        val tokenCount: Int,
    )

    private companion object {
        const val WORD_SEPARATOR = ' '
        const val LEARNING_STATUS = "learning"
        val WORD_REGEX = Regex("[\\p{L}]+(?:['’][\\p{L}]+)?")
        val PHRASE_SEPARATOR_REGEX = Regex("[\\s-]+")
        val CEFR_LEVELS = listOf("A1", "A2", "B1", "B2", "C1", "C2")
        val VERB_PREFIXES = listOf("(to) ", "to ")
        val IRREGULAR_LEMMAS = mapOf(
            "am" to "be",
            "are" to "be",
            "is" to "be",
            "was" to "be",
            "were" to "be",
            "been" to "be",
            "has" to "have",
            "had" to "have",
            "does" to "do",
            "did" to "do",
            "done" to "do",
            "went" to "go",
            "gone" to "go",
            "ate" to "eat",
            "eaten" to "eat",
            "people" to "person",
            "children" to "child",
            "men" to "man",
            "women" to "woman",
            "mice" to "mouse",
            "feet" to "foot",
            "teeth" to "tooth",
            "better" to "good",
            "best" to "good",
            "worse" to "bad",
            "worst" to "bad",
        )
    }
}
