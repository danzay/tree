package com.tree.app.vocabulary

import com.tree.api.model.CefrLevel
import com.tree.api.model.LearningStatus
import com.tree.api.model.ReviewStatus
import com.tree.api.model.StatsResponse
import com.tree.api.model.UpdateWordStatusRequest
import com.tree.api.model.VocabularySenseResponse
import com.tree.api.model.WordsResponse
import com.tree.app.auth.MANAGE_INVITATIONS_AUTHORITY
import com.tree.app.auth.TreeUserPrincipal
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import java.util.UUID

class VocabularyControllerTests {
    private val repository = RecordingVocabularyRepository()
    private val controller = VocabularyController(repository, repository)

    @Test
    fun `passes validated search values to the repository`() {
        controller.words(
            principal = TEST_PRINCIPAL,
            search = "sight",
            level = "B1",
            status = "learning",
            partOfSpeech = "noun",
            language = "ru",
            limit = 20,
            offset = 0,
        )

        assertEquals("sight", repository.lastQuery?.search)
        assertEquals("B1", repository.lastQuery?.level)
        assertEquals(20, repository.lastQuery?.limit)
    }

    @Test
    fun `rejects unsupported learning statuses`() {
        assertFailsWith<IllegalArgumentException> {
            controller.words(
                principal = TEST_PRINCIPAL,
                search = null,
                level = null,
                status = "unknown",
                partOfSpeech = null,
                language = "ru",
                limit = 30,
                offset = 0,
            )
        }
    }

    @Test
    fun `updates status for the current user`() {
        controller.updateWordStatus(
            principal = TEST_PRINCIPAL,
            id = 42,
            request = UpdateWordStatusRequest(LearningStatus.known),
        )

        assertEquals(TEST_USER_ID, repository.updatedUserId)
        assertEquals(42, repository.updatedId)
        assertEquals("known", repository.updatedStatus)
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

private class RecordingVocabularyRepository : VocabularyReader, VocabularyWriter {
    var lastQuery: WordSearchQuery? = null
    var updatedId: Long? = null
    var updatedStatus: String? = null
    var updatedUserId: UUID? = null

    override fun checkHealth() = Unit

    override fun getStats(userId: UUID) =
        StatsResponse(0, 0, emptyMap(), emptyMap(), emptyMap(), emptyList())

    override fun search(userId: UUID, query: WordSearchQuery): WordsResponse {
        assertEquals(TEST_USER_ID, userId)
        lastQuery = query
        return WordsResponse(emptyList(), 0, query.limit, query.offset)
    }

    override fun findById(userId: UUID, id: Long, language: String): VocabularySenseResponse? = null

    override fun updateStatus(
        userId: UUID,
        id: Long,
        status: String,
        language: String,
    ): VocabularySenseResponse? {
        updatedId = id
        updatedStatus = status
        updatedUserId = userId

        return VocabularySenseResponse(
            id = id.toString(),
            word = "sight",
            definition = null,
            transcription = null,
            level = CefrLevel.B1,
            reviewStatus = ReviewStatus.verified,
            status = LearningStatus.forValue(status),
            partsOfSpeech = emptyList(),
            translations = emptyList(),
            collocations = emptyList(),
            catalogueLevels = emptyList(),
        )
    }
}
