package com.tree.app.configuration

import com.tree.api.model.ErrorResponse
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
    fun invalidInput(): ErrorResponse = ErrorResponse(error = "Invalid request")

    @ExceptionHandler(AuthApiException::class)
    fun authError(exception: AuthApiException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(exception.status).body(ErrorResponse(error = exception.code))
}
