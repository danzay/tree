package com.tree.app.auth

import org.springframework.http.HttpStatus

class AuthApiException(
    val status: HttpStatus,
    val code: String,
) : RuntimeException(code)
