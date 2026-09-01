package com.tree.app.auth

import java.util.UUID
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class TreeUserPrincipalTests {
    @Test
    fun `exposes safe account data and erases credentials`() {
        val userId = UUID.randomUUID()
        val principal = TreeUserPrincipal(
            id = userId,
            email = "learner@example.com",
            displayName = "Tree Learner",
            internalAuthorities = setOf(MANAGE_INVITATIONS_AUTHORITY),
            googleLinked = true,
            passwordHash = "encoded-secret",
            enabled = true,
        )

        assertEquals("encoded-secret", principal.password)
        assertEquals(
            setOf(MANAGE_INVITATIONS_AUTHORITY),
            principal.authorities.map { it.authority }.toSet(),
        )
        assertEquals(userId.toString(), principal.toResponse().id)
        assertEquals(true, principal.toResponse().canManageInvitations)

        principal.eraseCredentials()

        assertNull(principal.password)
    }
}
