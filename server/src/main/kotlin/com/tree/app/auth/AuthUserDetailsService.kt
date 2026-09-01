package com.tree.app.auth

import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import java.util.Locale

@Service
class AuthUserDetailsService(
    private val repository: AuthRepository,
) : UserDetailsService {
    override fun loadUserByUsername(username: String): UserDetails {
        val normalizedEmail = username.trim().lowercase(Locale.ROOT)
        val user = repository.findUserByEmail(normalizedEmail)
            ?: throw UsernameNotFoundException("Invalid credentials")
        if (user.passwordHash == null) {
            throw UsernameNotFoundException("Invalid credentials")
        }

        return TreeUserPrincipal(
            id = user.id,
            email = user.email,
            displayName = user.displayName,
            internalAuthorities = user.internalAuthorities,
            googleLinked = user.googleLinked,
            passwordHash = user.passwordHash,
            enabled = user.accountStatus == "active",
        )
    }
}
