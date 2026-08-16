package com.tree.app.vocabulary

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Repository
import java.text.Normalizer
import java.util.Locale

@Repository
class VocabularyRepository(
    private val jdbc: NamedParameterJdbcTemplate,
) : VocabularyReader {
    override fun checkHealth() {
        jdbc.jdbcTemplate.queryForObject("SELECT 1", Int::class.java)
    }

    override fun getStats(): StatsResponse {
        val summary = jdbc.jdbcTemplate.queryForMap(
            """
            SELECT count(*) AS senses,
                   count(DISTINCT headword_id) AS headwords
            FROM senses
            """.trimIndent(),
        )

        return StatsResponse(
            senses = (summary.getValue("senses") as Number).toLong(),
            headwords = (summary.getValue("headwords") as Number).toLong(),
            byLevel = countByKey(
                "SELECT cefr_level AS key, count(*) AS count FROM senses GROUP BY cefr_level",
            ),
            byStatus = countByKey(
                "SELECT status AS key, count(*) AS count FROM sense_progress GROUP BY status",
            ),
            reconciliation = countByKey(
                """
                SELECT issue_type AS key, count(*) AS count
                FROM reconciliation_items
                WHERE status = 'open'
                GROUP BY issue_type
                """.trimIndent(),
            ),
        )
    }

    override fun search(query: WordSearchQuery): WordsResponse {
        val parameters = MapSqlParameterSource()
            .addValue("limit", query.limit)
            .addValue("offset", query.offset)
        val filters = mutableListOf<String>()
        val ordering = mutableListOf<String>()

        if (!query.includeNeedsReview) {
            filters += "s.review_status <> 'needs_review'"
        }

        query.search?.takeIf { it.isNotBlank() }?.let { search ->
            parameters.addValue("search", normalizeHeadword(search))
            filters += "strpos(h.normalized_word, :search) > 0"
            ordering += """
                CASE
                  WHEN h.normalized_word = :search THEN 0
                  WHEN h.normalized_word = 'to ' || :search THEN 1
                  WHEN strpos(h.normalized_word, :search) = 1 THEN 2
                  ELSE 3
                END
            """.trimIndent()
        }

        query.level?.let {
            parameters.addValue("level", it)
            filters += "s.cefr_level = :level"
        }
        query.status?.let {
            parameters.addValue("status", it)
            filters += "sp.status = :status"
        }
        query.partOfSpeech?.let {
            parameters.addValue("partOfSpeech", it)
            filters += """
                EXISTS (
                  SELECT 1
                  FROM sense_parts_of_speech filter_pos
                  WHERE filter_pos.sense_id = s.id
                    AND filter_pos.part_of_speech_code = :partOfSpeech
                )
            """.trimIndent()
        }

        val whereClause = filters.takeIf { it.isNotEmpty() }
            ?.joinToString(prefix = "WHERE ", separator = " AND ")
            .orEmpty()
        val orderClause = (ordering + listOf("h.normalized_word", "s.sense_order", "s.id"))
            .joinToString()
        val rows = jdbc.query(
            """
            $SELECT_WORD_FIELDS
            $whereClause
            ORDER BY $orderClause
            LIMIT :limit OFFSET :offset
            """.trimIndent(),
            parameters,
            WORD_ROW_MAPPER,
        )

        return WordsResponse(
            items = enrich(rows, query.language),
            total = rows.firstOrNull()?.total ?: 0,
            limit = query.limit,
            offset = query.offset,
        )
    }

    override fun findById(id: Long, language: String): VocabularySenseResponse? {
        val rows = jdbc.query(
            "$SELECT_WORD_FIELDS WHERE s.id = :id",
            mapOf("id" to id),
            WORD_ROW_MAPPER,
        )
        return enrich(rows, language).firstOrNull()
    }

    private fun enrich(
        rows: List<VocabularySenseRow>,
        language: String,
    ): List<VocabularySenseResponse> {
        if (rows.isEmpty()) {
            return emptyList()
        }

        val ids = rows.map { it.id }
        val partsOfSpeech = jdbc.query(
            """
            SELECT sense_id, part_of_speech_code
            FROM sense_parts_of_speech
            WHERE sense_id IN (:ids)
            ORDER BY part_of_speech_code
            """.trimIndent(),
            mapOf("ids" to ids),
        ) { resultSet, _ ->
            resultSet.getLong("sense_id") to resultSet.getString("part_of_speech_code")
        }.groupBy({ it.first }, { it.second })
        val translations = jdbc.query(
            """
            SELECT sense_id, language_code, translation
            FROM sense_translations
            WHERE sense_id IN (:ids) AND language_code = :language
            ORDER BY language_code, position
            """.trimIndent(),
            mapOf("ids" to ids, "language" to language),
        ) { resultSet, _ ->
            resultSet.getLong("sense_id") to TranslationResponse(
                language = resultSet.getString("language_code"),
                text = resultSet.getString("translation"),
            )
        }.groupBy({ it.first }, { it.second })
        val collocations = jdbc.query(
            """
            SELECT sense_id, text
            FROM sense_collocations
            WHERE sense_id IN (:ids)
            ORDER BY position
            """.trimIndent(),
            mapOf("ids" to ids),
        ) { resultSet, _ ->
            resultSet.getLong("sense_id") to resultSet.getString("text")
        }.groupBy({ it.first }, { it.second })

        return rows.map { row ->
            VocabularySenseResponse(
                id = row.id.toString(),
                word = row.word,
                definition = row.definition,
                transcription = row.transcription,
                level = row.level,
                reviewStatus = row.reviewStatus,
                status = row.status,
                partsOfSpeech = partsOfSpeech[row.id].orEmpty(),
                translations = translations[row.id].orEmpty(),
                collocations = collocations[row.id].orEmpty(),
            )
        }
    }

    private fun countByKey(sql: String): Map<String, Long> =
        jdbc.jdbcTemplate.query(sql) { resultSet, _ ->
            resultSet.getString("key") to resultSet.getLong("count")
        }.associate { it }

    private fun normalizeHeadword(word: String): String =
        Normalizer.normalize(word, Normalizer.Form.NFKC)
            .trim()
            .replace(WHITESPACE_REGEX, " ")
            .lowercase(Locale.ENGLISH)

    private companion object {
        val WHITESPACE_REGEX = Regex("\\s+")
        val WORD_ROW_MAPPER = { resultSet: java.sql.ResultSet, _: Int ->
            VocabularySenseRow(
                id = resultSet.getLong("id"),
                word = resultSet.getString("word"),
                definition = resultSet.getString("definition"),
                transcription = resultSet.getString("transcription"),
                level = resultSet.getString("level"),
                reviewStatus = resultSet.getString("review_status"),
                status = resultSet.getString("status"),
                total = resultSet.getLong("total"),
            )
        }
        const val SELECT_WORD_FIELDS = """
            SELECT s.id,
                   h.word,
                   s.definition_en AS definition,
                   s.transcription,
                   s.cefr_level AS level,
                   s.review_status,
                   sp.status,
                   count(*) OVER() AS total
            FROM senses s
            JOIN headwords h ON h.id = s.headword_id
            JOIN sense_progress sp ON sp.sense_id = s.id
        """
    }
}
