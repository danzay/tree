package com.tree.app.auth

import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.stereotype.Component

@Component
class InvitationAdministratorBootstrap(
    private val authService: AuthService,
    private val properties: AuthProperties,
) : ApplicationRunner {
    override fun run(args: ApplicationArguments) {
        val email = properties.bootstrap.email.trim()
        val password = properties.bootstrap.password
        val hasEmail = email.isNotEmpty()
        val hasPassword = password.isNotEmpty()
        if (hasEmail != hasPassword) {
            throw IllegalStateException(
                "BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD must be configured together",
            )
        }
        if (!hasEmail) {
            LOGGER.info(
                "Invitation administrator bootstrap credentials are not configured; existing accounts are unchanged",
            )
            return
        }

        val administrator = authService.bootstrapInvitationAdministrator(
            email,
            properties.bootstrap.displayName,
            password,
        )
        if (administrator != null) {
            LOGGER.info("Initial Tree invitation administrator account created")
        }
    }

    private companion object {
        val LOGGER = LoggerFactory.getLogger(InvitationAdministratorBootstrap::class.java)
    }
}
