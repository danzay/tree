package com.tree.app.vocabulary

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api")
class VocabularyController(
    private val repository: VocabularyReader,
) {
    @GetMapping("/health")
    fun health(): Map<String, String> {
        repository.checkHealth()
        return mapOf("status" to "ok", "database" to "reachable")
    }

    @GetMapping("/stats")
    fun stats(): StatsResponse = repository.getStats()

    @GetMapping("/words")
    fun words(
        @RequestParam(name = "q", required = false) search: String?,
        @RequestParam(required = false) level: String?,
        @RequestParam(required = false) status: String?,
        @RequestParam(required = false) partOfSpeech: String?,
        @RequestParam(defaultValue = "ru") language: String,
        @RequestParam(defaultValue = "false") includeNeedsReview: Boolean,
        @RequestParam(defaultValue = "30") limit: Int,
        @RequestParam(defaultValue = "0") offset: Int,
    ): WordsResponse {
        val normalizedLanguage = language.trim()
        val normalizedPartOfSpeech = partOfSpeech?.trim()
        validateQuery(
            search,
            level,
            status,
            normalizedPartOfSpeech,
            normalizedLanguage,
            limit,
            offset,
        )
        return repository.search(
            WordSearchQuery(
                search = search,
                level = level,
                status = status,
                partOfSpeech = normalizedPartOfSpeech,
                language = normalizedLanguage,
                includeNeedsReview = includeNeedsReview,
                limit = limit,
                offset = offset,
            ),
        )
    }

    @GetMapping("/words/{id}")
    fun word(
        @PathVariable id: Long,
        @RequestParam(defaultValue = "ru") language: String,
    ): VocabularySenseResponse {
        val normalizedLanguage = language.trim()
        require(id > 0) { "Word sense ID must be positive" }
        require(LANGUAGE_REGEX.matches(normalizedLanguage)) { "Invalid language code" }
        return repository.findById(id, normalizedLanguage)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Word sense not found")
    }

    private fun validateQuery(
        search: String?,
        level: String?,
        status: String?,
        partOfSpeech: String?,
        language: String,
        limit: Int,
        offset: Int,
    ) {
        require(search == null || search.trim().length <= 100) { "Search is too long" }
        require(level == null || level in CEFR_LEVELS) { "Invalid CEFR level" }
        require(status == null || status in PROGRESS_STATUSES) { "Invalid learning status" }
        require(partOfSpeech == null || PART_OF_SPEECH_REGEX.matches(partOfSpeech)) {
            "Invalid part of speech"
        }
        require(LANGUAGE_REGEX.matches(language)) { "Invalid language code" }
        require(limit in 1..100) { "Limit must be between 1 and 100" }
        require(offset in 0..100_000) { "Offset must be between 0 and 100000" }
    }

    private companion object {
        val CEFR_LEVELS = setOf("A1", "A2", "B1", "B2", "C1", "C2")
        val PROGRESS_STATUSES = setOf("new", "learning", "reviewing", "learned", "known", "suspended")
        val LANGUAGE_REGEX = Regex("^[a-z]{2,3}(-[A-Za-z0-9]+)*$")
        val PART_OF_SPEECH_REGEX = Regex("^[a-z_]+$")
    }
}
