package com.tree.app.translation

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TranslationControllerTests {
    private val reader = RecordingTranslationReader()
    private val controller = TranslationController(reader)

    @Test
    fun `normalizes validated lookup text`() {
        controller.lookup(" court ")

        assertEquals("court", reader.text)
    }

    @Test
    fun `rejects an empty lookup`() {
        assertFailsWith<IllegalArgumentException> {
            controller.lookup(" ")
        }
    }

    @Test
    fun `rejects an excessively long lookup`() {
        assertFailsWith<IllegalArgumentException> {
            controller.lookup("a".repeat(101))
        }
    }
}

private class RecordingTranslationReader : TranslationReader {
    var text: String? = null

    override fun lookup(text: String): TranslationLookupResponse {
        this.text = text
        return TranslationLookupResponse(emptyList())
    }
}
