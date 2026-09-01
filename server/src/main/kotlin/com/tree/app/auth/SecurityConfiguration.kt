package com.tree.app.auth

import jakarta.servlet.http.HttpServletResponse
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.ProviderManager
import org.springframework.security.authentication.dao.DaoAuthenticationProvider
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.security.oauth2.client.registration.ClientRegistrations
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.context.HttpSessionSecurityContextRepository
import org.springframework.security.web.context.SecurityContextRepository
import org.springframework.security.web.csrf.CookieCsrfTokenRepository
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler
import java.time.Clock

@Configuration
@EnableMethodSecurity
class SecurityConfiguration(
    private val properties: AuthProperties,
    private val googleSuccessHandler: GoogleOAuthSuccessHandler,
    private val googleFailureHandler: GoogleOAuthFailureHandler,
) {
    @Bean
    fun securityFilterChain(
        http: HttpSecurity,
        securityContextRepository: SecurityContextRepository,
    ): SecurityFilterChain {
        val csrfRepository = CookieCsrfTokenRepository.withHttpOnlyFalse()
        csrfRepository.setCookiePath("/")
        http
            .authorizeHttpRequests { authorization ->
                authorization
                    .requestMatchers("/api/auth/invitations").hasAuthority(MANAGE_INVITATIONS_AUTHORITY)
                    .requestMatchers("/api/auth/me", "/api/auth/google/link-intent").authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/auth/config", "/api/auth/csrf").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/register").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/google/intent").permitAll()
                    .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/health", "/actuator/health", "/actuator/info")
                    .permitAll()
                    .anyRequest().authenticated()
            }
            .csrf { csrf ->
                csrf
                    .csrfTokenRepository(csrfRepository)
                    .csrfTokenRequestHandler(CsrfTokenRequestAttributeHandler())
            }
            .securityContext { securityContext ->
                securityContext
                    .securityContextRepository(securityContextRepository)
                    .requireExplicitSave(true)
            }
            .sessionManagement { sessions ->
                sessions.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            }
            .requestCache { requestCache -> requestCache.disable() }
            .httpBasic { basic -> basic.disable() }
            .formLogin { form -> form.disable() }
            .logout { logout ->
                logout
                    .logoutUrl("/api/auth/logout")
                    .invalidateHttpSession(true)
                    .clearAuthentication(true)
                    .deleteCookies("TREE_SESSION", "XSRF-TOKEN")
                    .logoutSuccessHandler { _, response, _ ->
                        response.status = HttpStatus.NO_CONTENT.value()
                    }
            }
            .exceptionHandling { exceptions ->
                exceptions
                    .authenticationEntryPoint { _, response, _ ->
                        writeSecurityError(response, HttpStatus.UNAUTHORIZED, "authentication_required")
                    }
                    .accessDeniedHandler { _, response, _ ->
                        writeSecurityError(response, HttpStatus.FORBIDDEN, "access_denied")
                    }
            }
        if (properties.google.enabled) {
            http.oauth2Login { oauth ->
                oauth
                    .successHandler(googleSuccessHandler)
                    .failureHandler(googleFailureHandler)
            }
        }

        return http.build()
    }

    private fun writeSecurityError(
        response: HttpServletResponse,
        status: HttpStatus,
        code: String,
    ) {
        response.status = status.value()
        response.contentType = "application/json"
        response.writer.write("{\"error\":\"$code\"}")
    }
}

@Configuration
class SecurityFoundationConfiguration {
    @Bean
    fun clock(): Clock = Clock.systemUTC()

    @Bean
    fun passwordEncoder(): PasswordEncoder = Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8()

    @Bean
    fun authenticationManager(
        userDetailsService: AuthUserDetailsService,
        passwordEncoder: PasswordEncoder,
    ): AuthenticationManager {
        val provider = DaoAuthenticationProvider(userDetailsService)
        provider.setPasswordEncoder(passwordEncoder)
        return ProviderManager(provider)
    }

    @Bean
    fun securityContextRepository(): SecurityContextRepository = HttpSessionSecurityContextRepository()
}

@Configuration
@ConditionalOnProperty(prefix = "tree.auth.google", name = ["enabled"], havingValue = "true")
class GoogleOAuthClientConfiguration {
    @Bean
    fun clientRegistrationRepository(properties: AuthProperties): ClientRegistrationRepository {
        require(properties.google.clientId.isNotBlank()) {
            "GOOGLE_CLIENT_ID is required when Google authentication is enabled"
        }
        require(properties.google.clientSecret.isNotBlank()) {
            "GOOGLE_CLIENT_SECRET is required when Google authentication is enabled"
        }
        require(properties.google.redirectUri.isNotBlank()) {
            "GOOGLE_REDIRECT_URI is required when Google authentication is enabled"
        }

        val registration = ClientRegistrations.fromIssuerLocation("https://accounts.google.com")
            .registrationId("google")
            .clientId(properties.google.clientId)
            .clientSecret(properties.google.clientSecret)
            .redirectUri(properties.google.redirectUri)
            .scope("openid", "profile", "email")
            .build()
        return InMemoryClientRegistrationRepository(registration)
    }
}
