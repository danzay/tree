package com.tree.app.translation

import com.tree.api.model.TranslationLookupResponse

interface TranslationReader {
    fun lookup(text: String): TranslationLookupResponse
}
