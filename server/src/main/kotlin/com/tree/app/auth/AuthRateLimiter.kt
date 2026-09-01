package com.tree.app.auth

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import java.time.Clock
import java.time.Duration
import java.time.Instant
import java.util.Locale
import java.util.concurrent.ConcurrentHashMap

@Component
class AuthRateLimiter(
    private val clock: Clock,
) {
    private val attempts = ConcurrentHashMap<String, AttemptWindow>()

    fun check(email: String) {
        val key = email.trim().lowercase(Locale.ROOT)
        val now = Instant.now(clock)
        val window = attempts[key] ?: return
        if (window.startedAt.plus(WINDOW_DURATION) <= now) {
            attempts.remove(key, window)
            return
        }
        if (window.failures >= MAX_FAILURES) {
            throw AuthApiException(HttpStatus.TOO_MANY_REQUESTS, "rate_limit_exceeded")
        }
    }

    fun recordFailure(email: String) {
        val key = email.trim().lowercase(Locale.ROOT)
        val now = Instant.now(clock)
        attempts.compute(key) { _, current ->
            if (current == null || current.startedAt.plus(WINDOW_DURATION) <= now) {
                AttemptWindow(startedAt = now, failures = 1)
            } else {
                current.copy(failures = current.failures + 1)
            }
        }
    }

    fun reset(email: String) {
        attempts.remove(email.trim().lowercase(Locale.ROOT))
    }

    private data class AttemptWindow(
        val startedAt: Instant,
        val failures: Int,
    )

    private companion object {
        const val MAX_FAILURES = 5
        val WINDOW_DURATION: Duration = Duration.ofMinutes(10)
    }
}
