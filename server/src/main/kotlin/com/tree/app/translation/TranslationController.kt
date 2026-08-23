package com.tree.app.translation

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/translations")
class TranslationController(
    private val translationReader: TranslationReader,
) {
    @GetMapping
    fun lookup(@RequestParam text: String): TranslationLookupResponse {
        val normalizedText = text.trim()
        require(normalizedText.length in 1..MAX_TEXT_LENGTH) {
            "Text must contain 1 to 100 characters"
        }

        return translationReader.lookup(normalizedText)
    }

    private companion object {
        const val MAX_TEXT_LENGTH = 100
    }
}
