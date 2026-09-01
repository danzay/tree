package com.tree.app.library

import com.tree.app.auth.TreeUserPrincipal
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/library-items")
class LibraryController(
    private val reader: LibraryReader,
) {
    @GetMapping
    fun libraryItems(
        @AuthenticationPrincipal principal: TreeUserPrincipal,
        @RequestParam(name = "q", required = false) search: String?,
        @RequestParam(required = false) type: String?,
    ): List<LibraryItemSummaryResponse> {
        require(search == null || search.trim().length <= 120) { "Search is too long" }
        require(type == null || type in LIBRARY_ITEM_TYPES) { "Invalid library item type" }

        return reader.list(principal.id, LibraryItemQuery(search = search, type = type))
    }

    @GetMapping("/{id}")
    fun libraryItem(
        @AuthenticationPrincipal principal: TreeUserPrincipal,
        @PathVariable id: Long,
    ): LibraryItemDetailResponse {
        require(id > 0) { "Library item ID must be positive" }

        return reader.findById(principal.id, id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Library item not found")
    }

    private companion object {
        val LIBRARY_ITEM_TYPES = setOf("article", "story", "video", "podcast", "note")
    }
}
