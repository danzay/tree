package com.tree.app.configuration

import com.tree.app.auth.AuthApiException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class ApiExceptionHandler {
    @ExceptionHandler(IllegalArgumentException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun invalidInput(): Map<String, String> = mapOf("error" to "Invalid request")

    @ExceptionHandler(AuthApiException::class)
    fun authError(exception: AuthApiException): ResponseEntity<Map<String, String>> =
        ResponseEntity.status(exception.status).body(mapOf("error" to exception.code))
}
