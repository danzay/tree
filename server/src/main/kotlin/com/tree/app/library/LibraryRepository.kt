package com.tree.app.library

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime

@Repository
class LibraryRepository(
    private val jdbc: NamedParameterJdbcTemplate,
) : LibraryReader {
    override fun list(query: LibraryItemQuery): List<LibraryItemSummaryResponse> {
        val parameters = MapSqlParameterSource()
        val filters = mutableListOf<String>()

        query.search?.takeIf { it.isNotBlank() }?.let { search ->
            parameters.addValue("search", "%${search.trim().lowercase()}%")
            filters += "(lower(title) LIKE :search OR lower(topic) LIKE :search)"
        }
        query.type?.let { type ->
            parameters.addValue("type", type)
            filters += "item_type = :type"
        }

        val whereClause = filters.takeIf { it.isNotEmpty() }
            ?.joinToString(prefix = "WHERE ", separator = " AND ")
            .orEmpty()

        return jdbc.query(
            """
            $SELECT_ITEM_FIELDS
            $whereClause
            ORDER BY last_opened_at DESC NULLS LAST, updated_at DESC, id DESC
            """.trimIndent(),
            parameters,
            ITEM_ROW_MAPPER,
        )
    }

    override fun findById(id: Long): LibraryItemDetailResponse? {
        val items = jdbc.query(
            "$SELECT_ITEM_FIELDS WHERE id = :id",
            mapOf("id" to id),
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
        val vocabularyMatcher = ArticleVocabularyMatcher(loadHighlightCandidates())
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

    private fun loadHighlightCandidates(): List<VocabularyHighlightCandidate> = jdbc.query(
        """
        SELECT s.id AS sense_id,
               h.word,
               h.normalized_word,
               s.cefr_level,
               sp.status
        FROM senses s
        JOIN headwords h ON h.id = s.headword_id
        JOIN sense_progress sp ON sp.sense_id = s.id
        WHERE s.cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1')
          AND sp.status IN ('new', 'learning')
          AND s.review_status <> 'needs_review'
        ORDER BY h.normalized_word, s.sense_order, s.id
        """.trimIndent(),
        emptyMap<String, Any>(),
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
                lastOpenedAt = resultSet.getObject("last_opened_at", OffsetDateTime::class.java)
                    ?.toInstant()
                    ?.toString(),
                updatedAt = resultSet.getObject("updated_at", OffsetDateTime::class.java)
                    .toInstant()
                    .toString(),
            )
        }
        const val SELECT_ITEM_FIELDS = """
            SELECT id,
                   slug,
                   title,
                   item_type,
                   summary,
                   topic,
                   cover_image_path,
                   estimated_read_minutes,
                   vocabulary_count,
                   reading_status,
                   last_opened_at,
                   updated_at
            FROM library_items
        """
    }
}
