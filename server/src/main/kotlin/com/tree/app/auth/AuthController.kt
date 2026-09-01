package com.tree.app.auth

import com.tree.api.model.AuthConfigResponse
import com.tree.api.model.AuthUserResponse
import com.tree.api.model.CsrfResponse
import com.tree.api.model.GoogleIntentRequest
import com.tree.api.model.GoogleIntentResponse
import com.tree.api.model.InvitationRequest
import com.tree.api.model.InvitationResponse
import com.tree.api.model.LoginRequest
import com.tree.api.model.RegistrationRequest
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.web.csrf.CsrfToken
import org.springframework.security.web.context.SecurityContextRepository
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService,
    private val authenticationManager: AuthenticationManager,
    private val securityContextRepository: SecurityContextRepository,
    private val rateLimiter: AuthRateLimiter,
    private val properties: AuthProperties,
) {
    @GetMapping("/config")
    fun config(): AuthConfigResponse = authService.getConfig()

    @GetMapping("/csrf")
    fun csrf(csrfToken: CsrfToken): CsrfResponse = CsrfResponse(
        headerName = csrfToken.headerName,
        token = csrfToken.token,
    )

    @GetMapping("/me")
    fun me(@AuthenticationPrincipal principal: TreeUserPrincipal): AuthUserResponse =
        principal.toResponse()

    @PostMapping("/login")
    fun login(
        @Valid @RequestBody requestBody: LoginRequest,
        request: HttpServletRequest,
        response: HttpServletResponse,
    ): AuthUserResponse {
        rateLimiter.check(requestBody.email)
        val authentication = try {
            authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(
                    requestBody.email.trim(),
                    requestBody.password,
                ),
            )
        } catch (_: org.springframework.security.core.AuthenticationException) {
            rateLimiter.recordFailure(requestBody.email)
            authService.recordFailedPasswordLogin(requestBody.email)
            throw AuthApiException(HttpStatus.UNAUTHORIZED, "invalid_credentials")
        }

        val principal = authentication.principal as TreeUserPrincipal
        rateLimiter.reset(requestBody.email)
        authService.recordSuccessfulPasswordLogin(principal.id)
        establishSession(authentication, request, response)
        return authService.getUser(principal.id).toResponse()
    }

    @PostMapping("/register")
    fun register(
        @Valid @RequestBody requestBody: RegistrationRequest,
        request: HttpServletRequest,
        response: HttpServletResponse,
    ): AuthUserResponse {
        rateLimiter.check(requestBody.email)
        val principal = try {
            authService.register(requestBody)
        } catch (exception: AuthApiException) {
            rateLimiter.recordFailure(requestBody.email)
            throw exception
        }

        rateLimiter.reset(requestBody.email)
        establishSession(authenticated(principal), request, response)
        return principal.toResponse()
    }

    @PostMapping("/google/intent")
    fun googleIntent(
        @Valid @RequestBody requestBody: GoogleIntentRequest,
        request: HttpServletRequest,
    ): GoogleIntentResponse {
        requireGoogleEnabled()
        val session = request.getSession(true)
        session.setAttribute(
            AuthSessionAttributes.GOOGLE_INVITATION_TOKEN,
            requestBody.invitationToken?.trim()?.takeIf { it.isNotEmpty() },
        )
        session.removeAttribute(AuthSessionAttributes.GOOGLE_LINK_USER_ID)
        return GoogleIntentResponse(GOOGLE_AUTHORIZATION_PATH)
    }

    @PostMapping("/google/link-intent")
    fun googleLinkIntent(
        @AuthenticationPrincipal principal: TreeUserPrincipal,
        request: HttpServletRequest,
    ): GoogleIntentResponse {
        requireGoogleEnabled()
        val session = request.getSession(true)
        session.setAttribute(AuthSessionAttributes.GOOGLE_LINK_USER_ID, principal.id.toString())
        session.removeAttribute(AuthSessionAttributes.GOOGLE_INVITATION_TOKEN)
        return GoogleIntentResponse(GOOGLE_AUTHORIZATION_PATH)
    }

    @PostMapping("/invitations")
    fun createInvitation(
        @AuthenticationPrincipal principal: TreeUserPrincipal,
        @Valid @RequestBody requestBody: InvitationRequest,
    ): InvitationResponse = authService.createInvitation(principal.id, requestBody)

    private fun establishSession(
        authentication: Authentication,
        request: HttpServletRequest,
        response: HttpServletResponse,
    ) {
        request.getSession(false)?.invalidate()
        val context = SecurityContextHolder.createEmptyContext()
        context.authentication = authentication
        SecurityContextHolder.setContext(context)
        securityContextRepository.saveContext(context, request, response)
    }

    private fun authenticated(principal: TreeUserPrincipal): Authentication =
        UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.authorities)

    private fun requireGoogleEnabled() {
        if (!properties.google.enabled) {
            throw AuthApiException(HttpStatus.NOT_FOUND, "google_login_unavailable")
        }
    }

    private companion object {
        const val GOOGLE_AUTHORIZATION_PATH = "/oauth2/authorization/google"
    }
}
