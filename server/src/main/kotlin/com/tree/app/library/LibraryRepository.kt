package com.tree.app.library

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime
import java.util.UUID

@Repository
class LibraryRepository(
    private val jdbc: NamedParameterJdbcTemplate,
) : LibraryReader {
    override fun list(userId: UUID, query: LibraryItemQuery): List<LibraryItemSummaryResponse> {
        val parameters = MapSqlParameterSource().addValue("userId", userId)
        val filters = mutableListOf("item.owner_user_id = :userId")

        query.search?.takeIf { it.isNotBlank() }?.let { search ->
            parameters.addValue("search", "%${search.trim().lowercase()}%")
            filters += "(lower(item.title) LIKE :search OR lower(item.topic) LIKE :search)"
        }
        query.type?.let { type ->
            parameters.addValue("type", type)
            filters += "item.item_type = :type"
        }

        val whereClause = filters.takeIf { it.isNotEmpty() }
            ?.joinToString(prefix = "WHERE ", separator = " AND ")
            .orEmpty()

        return jdbc.query(
            """
            $SELECT_ITEM_FIELDS
            $whereClause
            ORDER BY progress.last_opened_at DESC NULLS LAST, item.updated_at DESC, item.id DESC
            """.trimIndent(),
            parameters,
            ITEM_ROW_MAPPER,
        )
    }

    override fun findById(userId: UUID, id: Long): LibraryItemDetailResponse? {
        val items = jdbc.query(
            "$SELECT_ITEM_FIELDS WHERE item.id = :id AND item.owner_user_id = :userId",
            mapOf("id" to id, "userId" to userId),
            ITEM_ROW_MAPPER,
        )
        val item = items.firstOrNull() ?: return null
        val blockRows = jdbc.query(
            """
            SELECT position, block_type, text
            FROM article_blocks
            WHERE library_item_id = :id
            ORDER BY position
            """.trimIndent(),
            mapOf("id" to id),
        ) { resultSet, _ ->
            ArticleBlockRow(
                position = resultSet.getInt("position"),
                type = resultSet.getString("block_type"),
                text = resultSet.getString("text"),
            )
        }
        val vocabularyMatcher = ArticleVocabularyMatcher(loadHighlightCandidates(userId))
        val blocks = blockRows.map { block ->
            ArticleBlockResponse(
                position = block.position,
                type = block.type,
                text = block.text,
                highlights = vocabularyMatcher.find(block.text),
            )
        }

        return LibraryItemDetailResponse(item = item, blocks = blocks)
    }

    private fun loadHighlightCandidates(userId: UUID): List<VocabularyHighlightCandidate> = jdbc.query(
        """
        SELECT s.id AS sense_id,
               h.word,
               h.normalized_word,
               s.cefr_level,
               COALESCE(user_progress.status, 'new') AS status
        FROM senses s
        JOIN headwords h ON h.id = s.headword_id
        LEFT JOIN user_sense_progress user_progress
          ON user_progress.sense_id = s.id AND user_progress.user_id = :userId
        WHERE s.cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')
          AND COALESCE(user_progress.status, 'new') IN ('new', 'learning')
        ORDER BY h.normalized_word, s.sense_order, s.id
        """.trimIndent(),
        mapOf("userId" to userId),
    ) { resultSet, _ ->
        VocabularyHighlightCandidate(
            senseId = resultSet.getLong("sense_id"),
            word = resultSet.getString("word"),
            normalizedWord = resultSet.getString("normalized_word"),
            level = resultSet.getString("cefr_level"),
            status = resultSet.getString("status"),
        )
    }

    private companion object {
        data class ArticleBlockRow(
            val position: Int,
            val type: String,
            val text: String,
        )

        val ITEM_ROW_MAPPER = { resultSet: java.sql.ResultSet, _: Int ->
            LibraryItemSummaryResponse(
                id = resultSet.getLong("id"),
                slug = resultSet.getString("slug"),
                title = resultSet.getString("title"),
                type = resultSet.getString("item_type"),
                summary = resultSet.getString("summary"),
                topic = resultSet.getString("topic"),
                coverImagePath = resultSet.getString("cover_image_path"),
                estimatedReadMinutes = resultSet.getInt("estimated_read_minutes"),
                vocabularyCount = resultSet.getInt("vocabulary_count"),
                readingStatus = resultSet.getString("reading_status"),
                youtubeVideoId = resultSet.getString("youtube_video_id"),
                lastOpenedAt = resultSet.getObject("last_opened_at", OffsetDateTime::class.java)
                    ?.toInstant()
                    ?.toString(),
                updatedAt = resultSet.getObject("updated_at", OffsetDateTime::class.java)
                    .toInstant()
                    .toString(),
            )
        }
        const val SELECT_ITEM_FIELDS = """
            SELECT item.id,
                   item.slug,
                   item.title,
                   item.item_type,
                   item.summary,
                   item.topic,
                   item.cover_image_path,
                   item.estimated_read_minutes,
                   item.vocabulary_count,
                   COALESCE(progress.reading_status, 'not_started') AS reading_status,
                   item.youtube_video_id,
                   progress.last_opened_at,
                   item.updated_at
            FROM library_items item
            LEFT JOIN user_library_progress progress
              ON progress.library_item_id = item.id AND progress.user_id = :userId
        """
    }
}
