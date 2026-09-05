package com.tree.app.vocabulary

import com.tree.api.model.CatalogueLevelResponse
import com.tree.api.model.CefrLevel
import com.tree.api.model.LearningStatus
import com.tree.api.model.LevelProgressResponse
import com.tree.api.model.ReviewStatus
import com.tree.api.model.StatsResponse
import com.tree.api.model.TranslationResponse
import com.tree.api.model.VocabularySenseResponse
import com.tree.api.model.WordsResponse
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.text.Normalizer
import java.util.Locale
import java.util.UUID

@Repository
class VocabularyRepository(
    private val jdbc: NamedParameterJdbcTemplate,
) : VocabularyReader, VocabularyWriter {
    override fun checkHealth() {
        jdbc.jdbcTemplate.queryForObject("SELECT 1", Int::class.java)
    }

    override fun getStats(userId: UUID): StatsResponse {
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
                """
                SELECT COALESCE(user_progress.status, 'to_learn') AS key, count(*) AS count
                FROM senses sense
                LEFT JOIN user_sense_progress user_progress
                  ON user_progress.sense_id = sense.id AND user_progress.user_id = :userId
                GROUP BY COALESCE(user_progress.status, 'to_learn')
                """.trimIndent(),
                mapOf("userId" to userId),
            ),
            reconciliation = countByKey(
                """
                SELECT issue_type AS key, count(*) AS count
                FROM reconciliation_items
                WHERE status = 'open'
                GROUP BY issue_type
                """.trimIndent(),
            ),
            levelProgress = getLevelProgress(userId),
        )
    }

    private fun getLevelProgress(userId: UUID): List<LevelProgressResponse> = jdbc.query(
        """
        WITH levels(level, position) AS (
          VALUES ('A1', 1), ('A2', 2), ('B1', 3), ('B2', 4), ('C1', 5), ('C2', 6)
        )
        SELECT levels.level,
               count(s.id) AS total,
               count(s.id) FILTER (
                 WHERE COALESCE(user_progress.status, 'to_learn') = 'known'
               ) AS known
        FROM levels
        LEFT JOIN senses s ON s.cefr_level = levels.level
        LEFT JOIN user_sense_progress user_progress
          ON user_progress.sense_id = s.id AND user_progress.user_id = :userId
        GROUP BY levels.level, levels.position
        ORDER BY levels.position
        """.trimIndent(),
        mapOf("userId" to userId),
    ) { resultSet, _ ->
        val total = resultSet.getLong("total")
        val known = resultSet.getLong("known")
        LevelProgressResponse(
            level = CefrLevel.forValue(resultSet.getString("level")),
            total = total,
            known = known,
            leftToLearn = total - known,
        )
    }

    override fun search(userId: UUID, query: WordSearchQuery): WordsResponse {
        val parameters = MapSqlParameterSource()
            .addValue("userId", userId)
            .addValue("limit", query.limit)
            .addValue("offset", query.offset)
        val filters = mutableListOf<String>()
        val ordering = mutableListOf<String>()

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
            filters += "COALESCE(user_progress.status, 'to_learn') = :status"
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

    override fun findById(userId: UUID, id: Long, language: String): VocabularySenseResponse? {
        val rows = jdbc.query(
            "$SELECT_WORD_FIELDS WHERE s.id = :id",
            mapOf("id" to id, "userId" to userId),
            WORD_ROW_MAPPER,
        )
        return enrich(rows, language).firstOrNull()
    }

    @Transactional
    override fun updateStatus(
        userId: UUID,
        id: Long,
        status: String,
        language: String,
    ): VocabularySenseResponse? {
        val statusBefore = jdbc.query(
            """
            SELECT COALESCE(user_progress.status, 'to_learn') AS status
            FROM senses sense
            LEFT JOIN user_sense_progress user_progress
              ON user_progress.sense_id = sense.id AND user_progress.user_id = :userId
            WHERE sense.id = :id
            """.trimIndent(),
            mapOf("id" to id, "userId" to userId),
        ) { resultSet, _ -> resultSet.getString("status") }.firstOrNull() ?: return null

        jdbc.update(
            """
            INSERT INTO user_sense_progress (
              user_id, sense_id, status, status_origin,
              started_at, learned_at, last_reviewed_at, updated_at, learning_stage
            )
            VALUES (
              :userId, :id, :status, 'manual',
              CASE WHEN :status = 'learning' THEN now() END,
              NULL,
              NULL,
              now(),
              CASE WHEN :status = 'learning' THEN 'acquiring' END
            )
            ON CONFLICT (user_id, sense_id) DO UPDATE
            SET status = EXCLUDED.status,
                status_origin = 'manual',
                started_at = CASE
                  WHEN EXCLUDED.status = 'to_learn' THEN NULL
                  WHEN EXCLUDED.status = 'learning'
                    THEN COALESCE(user_sense_progress.started_at, now())
                  ELSE user_sense_progress.started_at
                END,
                learned_at = CASE
                  WHEN EXCLUDED.status IN ('to_learn', 'known') THEN NULL
                  ELSE user_sense_progress.learned_at
                END,
                last_reviewed_at = CASE
                  WHEN EXCLUDED.status = 'to_learn' THEN NULL
                  ELSE user_sense_progress.last_reviewed_at
                END,
                learning_stage = CASE
                  WHEN EXCLUDED.status <> 'learning' THEN NULL
                  WHEN user_sense_progress.status = 'learning'
                    THEN COALESCE(user_sense_progress.learning_stage, 'acquiring')
                  ELSE 'acquiring'
                END,
                updated_at = now()
            """.trimIndent(),
            mapOf("id" to id, "status" to status, "userId" to userId),
        )

        if (statusBefore != status) {
            jdbc.update(
                """
                INSERT INTO review_events (
                  client_event_id, user_id, sense_id, exercise_type, result,
                  status_before, status_after
                )
                VALUES (
                  :eventId, :userId, :id, 'manual_status_change', 'manual',
                  :statusBefore, :statusAfter
                )
                """.trimIndent(),
                mapOf(
                    "eventId" to UUID.randomUUID(),
                    "id" to id,
                    "statusAfter" to status,
                    "statusBefore" to statusBefore,
                    "userId" to userId,
                ),
            )
        }

        return findById(userId, id, language)
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
        val catalogueLevels = jdbc.query(
            """
            SELECT mapping.sense_id,
                   entry.source_code,
                   source.display_name,
                   entry.cefr_level
            FROM catalogue_entry_senses mapping
            JOIN catalogue_entries entry ON entry.id = mapping.catalogue_entry_id
            JOIN catalogue_sources source ON source.code = entry.source_code
            WHERE mapping.sense_id IN (:ids)
              AND entry.cefr_level IS NOT NULL
            ORDER BY mapping.sense_id, source.display_priority, entry.cefr_level
            """.trimIndent(),
            mapOf("ids" to ids),
        ) { resultSet, _ ->
            resultSet.getLong("sense_id") to CatalogueLevelResponse(
                source = resultSet.getString("source_code"),
                sourceName = resultSet.getString("display_name"),
                level = CefrLevel.forValue(resultSet.getString("cefr_level")),
            )
        }.groupBy({ it.first }, { it.second })

        return rows.map { row ->
            VocabularySenseResponse(
                id = row.id.toString(),
                word = row.word,
                definition = row.definition,
                transcription = row.transcription,
                level = CefrLevel.forValue(row.level),
                reviewStatus = ReviewStatus.forValue(row.reviewStatus),
                status = LearningStatus.forValue(row.status),
                partsOfSpeech = partsOfSpeech[row.id].orEmpty(),
                translations = translations[row.id].orEmpty(),
                collocations = collocations[row.id].orEmpty(),
                catalogueLevels = catalogueLevels[row.id].orEmpty().distinct(),
            )
        }
    }

    private fun countByKey(sql: String): Map<String, Long> =
        jdbc.jdbcTemplate.query(sql) { resultSet, _ ->
            resultSet.getString("key") to resultSet.getLong("count")
        }.associate { it }

    private fun countByKey(sql: String, parameters: Map<String, Any>): Map<String, Long> =
        jdbc.query(sql, parameters) { resultSet, _ ->
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
                   COALESCE(user_progress.status, 'to_learn') AS status,
                   count(*) OVER() AS total
            FROM senses s
            JOIN headwords h ON h.id = s.headword_id
            LEFT JOIN user_sense_progress user_progress
              ON user_progress.sense_id = s.id AND user_progress.user_id = :userId
        """
    }
}
