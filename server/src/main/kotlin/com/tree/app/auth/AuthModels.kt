package com.tree.app.auth

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

data class LoginRequest(
    @field:Email
    @field:NotBlank
    @field:Size(max = 254)
    val email: String,
    @field:NotBlank
    @field:Size(min = 12, max = 128)
    val password: String,
)

data class RegistrationRequest(
    @field:Email
    @field:NotBlank
    @field:Size(max = 254)
    val email: String,
    @field:NotBlank
    @field:Size(min = 2, max = 80)
    val displayName: String,
    @field:NotBlank
    @field:Size(min = 12, max = 128)
    val password: String,
    @field:NotBlank
    @field:Size(max = 512)
    val invitationToken: String,
)

data class GoogleIntentRequest(
    @field:Size(max = 512)
    val invitationToken: String? = null,
)

data class InvitationRequest(
    @field:Email
    @field:NotBlank
    @field:Size(max = 254)
    val email: String,
)

data class AuthUserResponse(
    val id: String,
    val email: String,
    val displayName: String,
    val canManageInvitations: Boolean,
    val googleLinked: Boolean,
)

data class AuthConfigResponse(
    val googleEnabled: Boolean,
)

data class CsrfResponse(
    val headerName: String,
    val token: String,
)

data class GoogleIntentResponse(
    val authorizationPath: String,
)

data class InvitationResponse(
    val email: String,
    val token: String,
    val expiresAt: Instant,
)

data class AuthUserRecord(
    val id: UUID,
    val email: String,
    val displayName: String,
    val accountStatus: String,
    val passwordHash: String?,
    val internalAuthorities: Set<String>,
    val googleLinked: Boolean,
)

data class InvitationRecord(
    val id: UUID,
    val normalizedEmail: String,
    val expiresAt: Instant,
    val acceptedAt: Instant?,
)
