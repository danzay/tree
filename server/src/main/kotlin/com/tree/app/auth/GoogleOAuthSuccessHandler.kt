package com.tree.app.auth

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.security.web.context.SecurityContextRepository
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class GoogleOAuthSuccessHandler(
    private val authService: AuthService,
    private val securityContextRepository: SecurityContextRepository,
    private val properties: AuthProperties,
) : AuthenticationSuccessHandler {
    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication,
    ) {
        val oidcUser = authentication.principal as? OidcUser
        if (oidcUser == null) {
            redirectToFailure(response)
            return
        }

        try {
            val session = request.getSession(false)
            val linkUserId = session
                ?.getAttribute(AuthSessionAttributes.GOOGLE_LINK_USER_ID)
                ?.toString()
                ?.let(UUID::fromString)
            val invitationToken = session
                ?.getAttribute(AuthSessionAttributes.GOOGLE_INVITATION_TOKEN)
                ?.toString()
            val email = requireNotNull(oidcUser.email?.takeIf { it.isNotBlank() })
            val subject = requireNotNull(oidcUser.subject?.takeIf { it.isNotBlank() })
            val emailVerified = oidcUser.getClaim<Boolean>("email_verified") == true
            val principal = if (linkUserId != null) {
                authService.linkGoogle(linkUserId, subject, email, emailVerified)
            } else {
                authService.registerOrLoginGoogle(
                    subject = subject,
                    email = email,
                    emailVerified = emailVerified,
                    displayName = oidcUser.fullName ?: email.substringBefore('@'),
                    invitationToken = invitationToken,
                )
            }
            session?.removeAttribute(AuthSessionAttributes.GOOGLE_LINK_USER_ID)
            session?.removeAttribute(AuthSessionAttributes.GOOGLE_INVITATION_TOKEN)

            val treeAuthentication = UsernamePasswordAuthenticationToken.authenticated(
                principal,
                null,
                principal.authorities,
            )
            val context = SecurityContextHolder.createEmptyContext()
            context.authentication = treeAuthentication
            SecurityContextHolder.setContext(context)
            securityContextRepository.saveContext(context, request, response)
            response.sendRedirect("${properties.clientBaseUrl.trimEnd('/')}/dictionary")
        } catch (_: RuntimeException) {
            redirectToFailure(response)
        }
    }

    private fun redirectToFailure(response: HttpServletResponse) {
        response.sendRedirect("${properties.clientBaseUrl.trimEnd('/')}/login?oauth=failed")
    }
}
