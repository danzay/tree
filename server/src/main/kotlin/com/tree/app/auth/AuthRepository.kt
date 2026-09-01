package com.tree.app.auth

import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Repository
import java.sql.ResultSet
import java.time.Instant
import java.time.OffsetDateTime
import java.util.UUID

@Repository
class AuthRepository(
    private val jdbc: NamedParameterJdbcTemplate,
) {
    fun countUsers(): Int = jdbc.jdbcTemplate.queryForObject(
        "SELECT count(*) FROM app_users",
        Int::class.java,
    ) ?: 0

    fun findUserByEmail(normalizedEmail: String): AuthUserRecord? = findUser(
        "WHERE user_account.normalized_email = :value",
        mapOf("value" to normalizedEmail),
    )

    fun findUserById(id: UUID): AuthUserRecord? = findUser(
        "WHERE user_account.id = :value",
        mapOf("value" to id),
    )

    fun findUserByGoogleSubject(subject: String): AuthUserRecord? = findUser(
        """
        JOIN external_identities identity ON identity.user_id = user_account.id
        WHERE identity.provider = 'google' AND identity.provider_subject = :value
        """.trimIndent(),
        mapOf("value" to subject),
    )

    fun createUser(id: UUID, email: String, normalizedEmail: String, displayName: String) {
        jdbc.update(
            """
            INSERT INTO app_users (id, email, normalized_email, display_name)
            VALUES (:id, :email, :normalizedEmail, :displayName)
            """.trimIndent(),
            mapOf(
                "id" to id,
                "email" to email,
                "normalizedEmail" to normalizedEmail,
                "displayName" to displayName,
            ),
        )
    }

    fun addCredential(userId: UUID, passwordHash: String) {
        jdbc.update(
            """
            INSERT INTO user_credentials (user_id, password_hash)
            VALUES (:userId, :passwordHash)
            """.trimIndent(),
            mapOf("userId" to userId, "passwordHash" to passwordHash),
        )
    }

    fun addAuthority(userId: UUID, authority: String) {
        jdbc.update(
            """
            INSERT INTO user_authorities (user_id, authority)
            VALUES (:userId, :authority)
            ON CONFLICT DO NOTHING
            """.trimIndent(),
            mapOf("userId" to userId, "authority" to authority),
        )
    }

    fun updateLastLogin(userId: UUID) {
        jdbc.update(
            "UPDATE app_users SET last_login_at = now(), updated_at = now() WHERE id = :userId",
            mapOf("userId" to userId),
        )
    }

    fun createInvitation(
        id: UUID,
        normalizedEmail: String,
        tokenHash: String,
        invitedBy: UUID,
        expiresAt: Instant,
    ) {
        jdbc.update(
            """
            INSERT INTO invitations (id, normalized_email, token_hash, invited_by, expires_at)
            VALUES (:id, :normalizedEmail, :tokenHash, :invitedBy, :expiresAt)
            """.trimIndent(),
            mapOf(
                "id" to id,
                "normalizedEmail" to normalizedEmail,
                "tokenHash" to tokenHash,
                "invitedBy" to invitedBy,
                "expiresAt" to OffsetDateTime.ofInstant(expiresAt, java.time.ZoneOffset.UTC),
            ),
        )
    }

    fun findInvitationForUpdate(tokenHash: String): InvitationRecord? = jdbc.query(
        """
        SELECT id, normalized_email, expires_at, accepted_at
        FROM invitations
        WHERE token_hash = :tokenHash
        FOR UPDATE
        """.trimIndent(),
        mapOf("tokenHash" to tokenHash),
    ) { resultSet, _ -> mapInvitation(resultSet) }.firstOrNull()

    fun acceptInvitation(invitationId: UUID, userId: UUID) {
        jdbc.update(
            """
            UPDATE invitations
            SET accepted_by = :userId, accepted_at = now()
            WHERE id = :invitationId AND accepted_at IS NULL
            """.trimIndent(),
            mapOf("invitationId" to invitationId, "userId" to userId),
        )
    }

    fun linkGoogleIdentity(userId: UUID, subject: String, providerEmail: String) {
        jdbc.update(
            """
            INSERT INTO external_identities (
              id, user_id, provider, provider_subject, provider_email
            ) VALUES (
              :id, :userId, 'google', :subject, :providerEmail
            )
            """.trimIndent(),
            mapOf(
                "id" to UUID.randomUUID(),
                "userId" to userId,
                "subject" to subject,
                "providerEmail" to providerEmail,
            ),
        )
    }

    fun touchGoogleIdentity(subject: String) {
        jdbc.update(
            """
            UPDATE external_identities
            SET last_login_at = now()
            WHERE provider = 'google' AND provider_subject = :subject
            """.trimIndent(),
            mapOf("subject" to subject),
        )
    }

    fun initializeNewUserProgress(userId: UUID) {
        jdbc.update(
            """
            INSERT INTO user_sense_progress (
              user_id, sense_id, status, status_origin
            )
            SELECT :userId, sense.id, 'new', 'system'
            FROM senses sense
            ON CONFLICT DO NOTHING
            """.trimIndent(),
            mapOf("userId" to userId),
        )
    }

    fun claimInitialData(userId: UUID): Boolean {
        val claimedBy = jdbc.queryForObject(
            "SELECT initial_data_claimed_by FROM auth_settings WHERE id = 1 FOR UPDATE",
            emptyMap<String, Any>(),
        ) { resultSet, _ -> resultSet.getObject("initial_data_claimed_by", UUID::class.java) }
        if (claimedBy != null) {
            return false
        }

        jdbc.update(
            """
            INSERT INTO user_sense_progress (
              user_id, sense_id, status, status_origin,
              started_at, learned_at, last_reviewed_at, updated_at
            )
            SELECT :userId, sense_id, status, status_origin,
                   started_at, learned_at, last_reviewed_at, updated_at
            FROM sense_progress
            ON CONFLICT DO NOTHING
            """.trimIndent(),
            mapOf("userId" to userId),
        )
        jdbc.update(
            "UPDATE review_events SET user_id = :userId WHERE user_id IS NULL",
            mapOf("userId" to userId),
        )
        jdbc.update(
            "UPDATE library_items SET owner_user_id = :userId WHERE owner_user_id IS NULL",
            mapOf("userId" to userId),
        )
        jdbc.update(
            """
            INSERT INTO user_library_progress (
              user_id, library_item_id, reading_status, last_opened_at, updated_at
            )
            SELECT :userId, id, reading_status, last_opened_at, updated_at
            FROM library_items
            WHERE owner_user_id = :userId
            ON CONFLICT DO NOTHING
            """.trimIndent(),
            mapOf("userId" to userId),
        )
        jdbc.update(
            """
            UPDATE auth_settings
            SET initial_data_claimed_by = :userId, updated_by = :userId, updated_at = now()
            WHERE id = 1
            """.trimIndent(),
            mapOf("userId" to userId),
        )
        return true
    }

    fun recordAudit(
        userId: UUID?,
        eventType: String,
        outcome: String,
        subject: String?,
    ) {
        jdbc.update(
            """
            INSERT INTO auth_audit_events (user_id, event_type, outcome, subject)
            VALUES (:userId, :eventType, :outcome, :subject)
            """.trimIndent(),
            mapOf(
                "userId" to userId,
                "eventType" to eventType,
                "outcome" to outcome,
                "subject" to subject,
            ),
        )
    }

    private fun findUser(joinAndWhere: String, parameters: Map<String, Any>): AuthUserRecord? {
        val baseUser = jdbc.query(
            """
            SELECT DISTINCT user_account.id,
                   user_account.email,
                   user_account.display_name,
                   user_account.account_status,
                   credential.password_hash,
                   EXISTS (
                     SELECT 1 FROM external_identities google_identity
                     WHERE google_identity.user_id = user_account.id
                       AND google_identity.provider = 'google'
                   ) AS google_linked
            FROM app_users user_account
            LEFT JOIN user_credentials credential ON credential.user_id = user_account.id
            $joinAndWhere
            """.trimIndent(),
            parameters,
        ) { resultSet, _ ->
            AuthUserRecord(
                id = resultSet.getObject("id", UUID::class.java),
                email = resultSet.getString("email"),
                displayName = resultSet.getString("display_name"),
                accountStatus = resultSet.getString("account_status"),
                passwordHash = resultSet.getString("password_hash"),
                internalAuthorities = emptySet(),
                googleLinked = resultSet.getBoolean("google_linked"),
            )
        }.firstOrNull() ?: return null
        val internalAuthorities = jdbc.query(
            "SELECT authority FROM user_authorities WHERE user_id = :userId ORDER BY authority",
            mapOf("userId" to baseUser.id),
        ) { resultSet, _ -> resultSet.getString("authority") }.toSet()
        return baseUser.copy(internalAuthorities = internalAuthorities)
    }

    private fun mapInvitation(resultSet: ResultSet): InvitationRecord = InvitationRecord(
        id = resultSet.getObject("id", UUID::class.java),
        normalizedEmail = resultSet.getString("normalized_email"),
        expiresAt = resultSet.getObject("expires_at", OffsetDateTime::class.java).toInstant(),
        acceptedAt = resultSet.getObject("accepted_at", OffsetDateTime::class.java)?.toInstant(),
    )
}
