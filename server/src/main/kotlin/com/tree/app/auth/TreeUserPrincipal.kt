package com.tree.app.auth

import com.tree.api.model.AuthUserResponse
import org.springframework.security.core.CredentialsContainer
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.io.Serializable
import java.util.UUID

class TreeUserPrincipal(
    val id: UUID,
    val email: String,
    val displayName: String,
    val internalAuthorities: Set<String>,
    val googleLinked: Boolean,
    passwordHash: String?,
    private val enabled: Boolean,
) : UserDetails, CredentialsContainer, Serializable {
    @Transient
    private var encodedPassword: String? = passwordHash

    override fun getAuthorities(): Collection<GrantedAuthority> =
        internalAuthorities.map(::SimpleGrantedAuthority)

    override fun getPassword(): String? = encodedPassword

    override fun getUsername(): String = email

    override fun isAccountNonExpired(): Boolean = true

    override fun isAccountNonLocked(): Boolean = enabled

    override fun isCredentialsNonExpired(): Boolean = true

    override fun isEnabled(): Boolean = enabled

    override fun eraseCredentials() {
        encodedPassword = null
    }

    fun toResponse(): AuthUserResponse = AuthUserResponse(
        id = id,
        email = email,
        displayName = displayName,
        canManageInvitations = internalAuthorities.contains(MANAGE_INVITATIONS_AUTHORITY),
        googleLinked = googleLinked,
    )

    private companion object {
        const val serialVersionUID = 1L
    }
}
