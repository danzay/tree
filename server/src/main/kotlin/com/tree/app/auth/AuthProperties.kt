package com.tree.app.auth

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties("tree.auth")
data class AuthProperties(
    var clientBaseUrl: String = "http://localhost:5173",
    var bootstrap: Bootstrap = Bootstrap(),
    var google: Google = Google(),
) {
    data class Bootstrap(
        var email: String = "",
        var password: String = "",
        var displayName: String = "Tree Administrator",
    )

    data class Google(
        var enabled: Boolean = false,
        var clientId: String = "",
        var clientSecret: String = "",
        var redirectUri: String = "http://localhost:5173/login/oauth2/code/google",
    )
}
