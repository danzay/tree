package com.tree.app.library

import com.tree.api.model.LibraryItemDetailResponse
import com.tree.api.model.LibraryItemSummaryResponse
import java.util.UUID

data class LibraryItemQuery(
    val search: String?,
    val type: String?,
)

interface LibraryReader {
    fun list(userId: UUID, query: LibraryItemQuery): List<LibraryItemSummaryResponse>

    fun findById(userId: UUID, id: Long): LibraryItemDetailResponse?
}
