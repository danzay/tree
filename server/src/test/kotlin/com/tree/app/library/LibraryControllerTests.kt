package com.tree.app.library

import com.tree.app.auth.MANAGE_INVITATIONS_AUTHORITY
import com.tree.app.auth.TreeUserPrincipal
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import java.util.UUID

class LibraryControllerTests {
    private val reader = RecordingLibraryReader()
    private val controller = LibraryController(reader)

    @Test
    fun `passes validated filters to the repository`() {
        controller.libraryItems(principal = TEST_PRINCIPAL, search = "meat", type = "article")

        assertEquals("meat", reader.lastQuery?.search)
        assertEquals("article", reader.lastQuery?.type)
    }

    @Test
    fun `rejects unsupported library item types`() {
        assertFailsWith<IllegalArgumentException> {
            controller.libraryItems(principal = TEST_PRINCIPAL, search = null, type = "document")
        }
    }

    @Test
    fun `rejects non-positive item identifiers`() {
        assertFailsWith<IllegalArgumentException> {
            controller.libraryItem(TEST_PRINCIPAL, 0)
        }
    }
}

private val TEST_USER_ID: UUID = UUID.fromString("00000000-0000-0000-0000-000000000001")
private val TEST_PRINCIPAL = TreeUserPrincipal(
    id = TEST_USER_ID,
    email = "administrator@example.com",
    displayName = "Administrator",
    internalAuthorities = setOf(MANAGE_INVITATIONS_AUTHORITY),
    googleLinked = false,
    passwordHash = null,
    enabled = true,
)

private class RecordingLibraryReader : LibraryReader {
    var lastQuery: LibraryItemQuery? = null

    override fun list(userId: UUID, query: LibraryItemQuery): List<LibraryItemSummaryResponse> {
        assertEquals(TEST_USER_ID, userId)
        lastQuery = query
        return emptyList()
    }

    override fun findById(userId: UUID, id: Long): LibraryItemDetailResponse? = null
}
