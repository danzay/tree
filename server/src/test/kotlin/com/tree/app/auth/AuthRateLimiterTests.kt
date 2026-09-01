package com.tree.app.auth

import org.springframework.http.HttpStatus
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class AuthRateLimiterTests {
    private val clock = Clock.fixed(Instant.parse("2026-08-18T10:00:00Z"), ZoneOffset.UTC)

    @Test
    fun `blocks an email after five failed attempts`() {
        val limiter = AuthRateLimiter(clock)

        repeat(5) {
            limiter.recordFailure("learner@example.com")
        }

        val exception = assertFailsWith<AuthApiException> {
            limiter.check("LEARNER@example.com")
        }
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, exception.status)
        assertEquals("rate_limit_exceeded", exception.code)
    }

    @Test
    fun `successful authentication resets failures`() {
        val limiter = AuthRateLimiter(clock)

        repeat(5) {
            limiter.recordFailure(" learner@example.com ")
        }
        limiter.reset("learner@example.com")

        limiter.check("learner@example.com")
    }
}
