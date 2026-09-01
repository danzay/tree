package com.tree.app.auth

import java.time.Instant
import java.util.UUID

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
