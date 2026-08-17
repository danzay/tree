package com.tree.app.library

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class LibraryControllerTests {
    private val reader = RecordingLibraryReader()
    private val controller = LibraryController(reader)

    @Test
    fun `passes validated filters to the repository`() {
        controller.libraryItems(search = "meat", type = "article")

        assertEquals("meat", reader.lastQuery?.search)
        assertEquals("article", reader.lastQuery?.type)
    }

    @Test
    fun `rejects unsupported library item types`() {
        assertFailsWith<IllegalArgumentException> {
            controller.libraryItems(search = null, type = "document")
        }
    }

    @Test
    fun `rejects non-positive item identifiers`() {
        assertFailsWith<IllegalArgumentException> {
            controller.libraryItem(0)
        }
    }
}

private class RecordingLibraryReader : LibraryReader {
    var lastQuery: LibraryItemQuery? = null

    override fun list(query: LibraryItemQuery): List<LibraryItemSummaryResponse> {
        lastQuery = query
        return emptyList()
    }

    override fun findById(id: Long): LibraryItemDetailResponse? = null
}
