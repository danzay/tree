package com.tree.app.translation

import com.tree.api.model.TranslationDefinitionResponse
import com.tree.api.model.TranslationLookupResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClient
import org.springframework.web.server.ResponseStatusException
import tools.jackson.databind.JsonNode
import tools.jackson.databind.ObjectMapper

@Service
internal class YandexDictionaryClient(
    restClientBuilder: RestClient.Builder,
    private val objectMapper: ObjectMapper,
    @Value("\${YANDEX_KEY}") private val apiKey: String,
) : TranslationReader {
    private val client = restClientBuilder.clone().baseUrl(API_BASE_URL).build()

    override fun lookup(text: String): TranslationLookupResponse {
        return try {
            val body = client.get()
                .uri { builder ->
                    builder.path(LOOKUP_PATH)
                        .queryParam("key", apiKey)
                        .queryParam("lang", LANGUAGE_PAIR)
                        .queryParam("text", text)
                        .queryParam("ui", UI_LANGUAGE)
                        .build()
                }
                .retrieve()
                .body(String::class.java)
                ?: throw ResponseStatusException(HttpStatus.BAD_GATEWAY)

            parse(objectMapper.readTree(body))
        } catch (exception: ResponseStatusException) {
            throw exception
        } catch (exception: Exception) {
            logger.warn("Yandex dictionary lookup failed: {}", exception.javaClass.simpleName)
            throw ResponseStatusException(HttpStatus.BAD_GATEWAY)
        }
    }

    private fun parse(root: JsonNode): TranslationLookupResponse = TranslationLookupResponse(
        definitions = root.path("def").toList().mapNotNull(::parseDefinition),
    )

    private fun parseDefinition(node: JsonNode): TranslationDefinitionResponse? {
        val translations = node.path("tr").toList().mapNotNull { translation ->
            translation.path("text").optionalText()
        }

        if (translations.isEmpty()) {
            return null
        }

        return TranslationDefinitionResponse(
            partOfSpeech = node.path("pos").optionalText(),
            translations = translations,
        )
    }

    private fun JsonNode.optionalText(): String? = takeIf(JsonNode::isString)
        ?.stringValue()
        ?.takeIf(String::isNotBlank)

    private companion object {
        val logger = LoggerFactory.getLogger(YandexDictionaryClient::class.java)
        const val API_BASE_URL = "https://dictionary.yandex.net"
        const val LOOKUP_PATH = "/api/v1/dicservice.json/lookup"
        const val LANGUAGE_PAIR = "en-ru"
        const val UI_LANGUAGE = "en"
    }
}
