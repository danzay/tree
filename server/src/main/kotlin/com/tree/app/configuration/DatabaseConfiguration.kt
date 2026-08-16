package com.tree.app.configuration

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.env.Environment
import java.net.URI
import java.net.URLDecoder
import java.nio.charset.StandardCharsets
import javax.sql.DataSource

@Configuration
class DatabaseConfiguration {
    @Bean
    fun dataSource(environment: Environment): DataSource {
        val databaseUrl = environment.getRequiredProperty("DATABASE_URL")
        val uri = URI(databaseUrl)
        require(uri.scheme == "postgresql" || uri.scheme == "postgres") {
            "DATABASE_URL must use the postgresql scheme"
        }

        val credentials = requireNotNull(uri.rawUserInfo) {
            "DATABASE_URL must include a username and password"
        }
        val separatorIndex = credentials.indexOf(':')
        require(separatorIndex > 0) {
            "DATABASE_URL must include a username and password"
        }

        val username = decode(credentials.substring(0, separatorIndex))
        val password = decode(credentials.substring(separatorIndex + 1))
        val port = if (uri.port == -1) 5432 else uri.port
        val query = uri.rawQuery?.let { "?$it" }.orEmpty()
        val jdbcUrl = "jdbc:postgresql://${uri.host}:$port${uri.rawPath}$query"

        return HikariDataSource(
            HikariConfig().apply {
                this.jdbcUrl = jdbcUrl
                this.username = username
                this.password = password
                maximumPoolSize = 10
                minimumIdle = 1
                poolName = "tree-database"
            },
        )
    }

    private fun decode(value: String): String =
        URLDecoder.decode(value, StandardCharsets.UTF_8)
}
