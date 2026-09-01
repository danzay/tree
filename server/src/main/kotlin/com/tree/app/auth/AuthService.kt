package com.tree.app.auth

import com.tree.api.model.AuthConfigResponse
import com.tree.api.model.InvitationRequest
import com.tree.api.model.InvitationResponse
import com.tree.api.model.RegistrationRequest
import org.springframework.dao.DuplicateKeyException
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.security.SecureRandom
import java.time.Clock
import java.time.Duration
import java.time.Instant
import java.time.ZoneOffset
import java.util.Base64
import java.util.Locale
import java.util.UUID

@Service
class AuthService(
    private val repository: AuthRepository,
    private val passwordEncoder: PasswordEncoder,
    private val properties: AuthProperties,
    private val clock: Clock = Clock.systemUTC(),
) {
    fun getConfig(): AuthConfigResponse = AuthConfigResponse(
        googleEnabled = properties.google.enabled,
    )

    fun getUser(userId: UUID): TreeUserPrincipal = repository.findUserById(userId)
        ?.toPrincipal()
        ?: throw AuthApiException(HttpStatus.UNAUTHORIZED, "authentication_required")

    @Transactional
    fun register(request: RegistrationRequest): TreeUserPrincipal {
        val normalizedEmail = normalizeEmail(request.email)
        val invitation = authorizeRegistration(normalizedEmail, request.invitationToken)
        val user = createUser(
            email = request.email.trim(),
            normalizedEmail = normalizedEmail,
            displayName = request.displayName.trim(),
            passwordHash = passwordEncoder.encode(request.password),
        )
        repository.acceptInvitation(invitation.id, user.id)

        repository.recordAudit(user.id, "register_password", "success", normalizedEmail)
        return user
    }

    @Transactional
    fun registerOrLoginGoogle(
        subject: String,
        email: String,
        emailVerified: Boolean,
        displayName: String,
        invitationToken: String?,
    ): TreeUserPrincipal {
        require(subject.isNotBlank()) { "Google subject is required" }
        if (!emailVerified) {
            throw AuthApiException(HttpStatus.UNAUTHORIZED, "google_email_not_verified")
        }

        repository.findUserByGoogleSubject(subject)?.let { existingUser ->
            repository.touchGoogleIdentity(subject)
            repository.updateLastLogin(existingUser.id)
            repository.recordAudit(existingUser.id, "login_google", "success", existingUser.email)
            return existingUser.toPrincipal()
        }

        val normalizedEmail = normalizeEmail(email)
        if (repository.findUserByEmail(normalizedEmail) != null) {
            throw AuthApiException(HttpStatus.CONFLICT, "google_account_link_required")
        }

        val invitation = authorizeRegistration(normalizedEmail, invitationToken)
        val user = createUser(
            email = email.trim(),
            normalizedEmail = normalizedEmail,
            displayName = displayName.trim().ifBlank { normalizedEmail.substringBefore('@') },
            passwordHash = null,
        )
        repository.linkGoogleIdentity(user.id, subject, email.trim())
        repository.acceptInvitation(invitation.id, user.id)

        repository.updateLastLogin(user.id)
        repository.recordAudit(user.id, "register_google", "success", normalizedEmail)
        return getUser(user.id)
    }

    @Transactional
    fun linkGoogle(userId: UUID, subject: String, email: String, emailVerified: Boolean): TreeUserPrincipal {
        if (!emailVerified) {
            throw AuthApiException(HttpStatus.UNAUTHORIZED, "google_email_not_verified")
        }

        val existingIdentity = repository.findUserByGoogleSubject(subject)
        if (existingIdentity != null && existingIdentity.id != userId) {
            throw AuthApiException(HttpStatus.CONFLICT, "google_identity_already_linked")
        }
        if (existingIdentity == null) {
            try {
                repository.linkGoogleIdentity(userId, subject, email.trim())
            } catch (_: DuplicateKeyException) {
                throw AuthApiException(HttpStatus.CONFLICT, "google_identity_already_linked")
            }
        }

        repository.recordAudit(userId, "link_google", "success", normalizeEmail(email))
        return getUser(userId)
    }

    @Transactional
    fun recordSuccessfulPasswordLogin(userId: UUID) {
        repository.updateLastLogin(userId)
        val user = repository.findUserById(userId)
        repository.recordAudit(userId, "login_password", "success", user?.email)
    }

    @Transactional
    fun recordFailedPasswordLogin(email: String) {
        repository.recordAudit(null, "login_password", "failure", normalizeEmail(email))
    }

    @Transactional
    fun createInvitation(userId: UUID, request: InvitationRequest): InvitationResponse {
        val normalizedEmail = normalizeEmail(request.email)
        if (repository.findUserByEmail(normalizedEmail) != null) {
            throw AuthApiException(HttpStatus.CONFLICT, "account_already_exists")
        }

        val token = generateToken()
        val expiresAt = Instant.now(clock).plus(INVITATION_LIFETIME)
        repository.createInvitation(
            id = UUID.randomUUID(),
            normalizedEmail = normalizedEmail,
            tokenHash = hashToken(token),
            invitedBy = userId,
            expiresAt = expiresAt,
        )
        repository.recordAudit(userId, "invitation_created", "success", normalizedEmail)
        return InvitationResponse(
            email = request.email.trim(),
            token = token,
            expiresAt = expiresAt.atOffset(ZoneOffset.UTC),
        )
    }

    @Transactional
    fun bootstrapInvitationAdministrator(
        email: String,
        displayName: String,
        password: String,
    ): TreeUserPrincipal? {
        if (repository.countUsers() > 0) {
            return null
        }
        validatePassword(password)
        val normalizedEmail = normalizeEmail(email)
        val userId = UUID.randomUUID()
        repository.createUser(userId, email.trim(), normalizedEmail, displayName.trim())
        repository.addCredential(userId, requireNotNull(passwordEncoder.encode(password)))
        repository.addAuthority(userId, MANAGE_INVITATIONS_AUTHORITY)
        repository.claimInitialData(userId)
        repository.recordAudit(userId, "bootstrap_invitation_administrator", "success", normalizedEmail)
        return getUser(userId)
    }

    private fun createUser(
        email: String,
        normalizedEmail: String,
        displayName: String,
        passwordHash: String?,
    ): TreeUserPrincipal {
        val userId = UUID.randomUUID()
        try {
            repository.createUser(userId, email, normalizedEmail, displayName)
        } catch (_: DuplicateKeyException) {
            throw AuthApiException(HttpStatus.CONFLICT, "account_already_exists")
        }
        if (passwordHash != null) {
            repository.addCredential(userId, passwordHash)
        }

        repository.initializeNewUserProgress(userId)
        return getUser(userId)
    }

    private fun authorizeRegistration(
        normalizedEmail: String,
        invitationToken: String?,
    ): InvitationRecord {
        if (invitationToken.isNullOrBlank()) {
            throw AuthApiException(HttpStatus.FORBIDDEN, "invitation_required")
        }

        val invitation = repository.findInvitationForUpdate(hashToken(invitationToken))
            ?: throw AuthApiException(HttpStatus.FORBIDDEN, "invalid_invitation")
        val invitationUnavailable = invitation.acceptedAt != null || invitation.expiresAt <= Instant.now(clock)
        if (invitationUnavailable || invitation.normalizedEmail != normalizedEmail) {
            throw AuthApiException(HttpStatus.FORBIDDEN, "invalid_invitation")
        }

        return invitation
    }

    private fun normalizeEmail(email: String): String = email.trim().lowercase(Locale.ROOT)

    private fun validatePassword(password: String) {
        if (password.length !in MIN_PASSWORD_LENGTH..MAX_PASSWORD_LENGTH) {
            throw IllegalArgumentException("Bootstrap password length is invalid")
        }
    }

    private fun generateToken(): String {
        val bytes = ByteArray(INVITATION_TOKEN_BYTES)
        SECURE_RANDOM.nextBytes(bytes)
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
    }

    private fun hashToken(token: String): String = MessageDigest.getInstance("SHA-256")
        .digest(token.toByteArray(StandardCharsets.UTF_8))
        .joinToString("") { byte -> "%02x".format(byte) }

    private fun AuthUserRecord.toPrincipal(): TreeUserPrincipal = TreeUserPrincipal(
        id = id,
        email = email,
        displayName = displayName,
        internalAuthorities = internalAuthorities,
        googleLinked = googleLinked,
        passwordHash = passwordHash,
        enabled = accountStatus == "active",
    )

    private companion object {
        const val MIN_PASSWORD_LENGTH = 12
        const val MAX_PASSWORD_LENGTH = 128
        const val INVITATION_TOKEN_BYTES = 32
        val INVITATION_LIFETIME: Duration = Duration.ofHours(24)
        val SECURE_RANDOM = SecureRandom()
    }
}
