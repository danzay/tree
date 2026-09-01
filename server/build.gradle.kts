plugins {
	kotlin("jvm") version "2.3.21"
	kotlin("plugin.spring") version "2.3.21"
	id("org.springframework.boot") version "4.1.0"
	id("io.spring.dependency-management") version "1.1.7"
	id("org.openapi.generator") version "7.25.0"
}

group = "com.tree"
version = "0.0.1-SNAPSHOT"
description = "Tree application backend"

val apiContractFile = rootProject.projectDir.resolve("../api-contract/openapi.yaml")

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(17)
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-actuator")
	implementation("org.springframework.boot:spring-boot-starter-flyway")
	implementation("org.springframework.boot:spring-boot-starter-jdbc")
	implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
	implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("org.springframework.boot:spring-boot-starter-validation")
	implementation("org.springframework.boot:spring-boot-starter-webmvc")
	implementation("org.flywaydb:flyway-database-postgresql")
	implementation("org.jetbrains.kotlin:kotlin-reflect")
	implementation("org.springframework.session:spring-session-jdbc")
	implementation("tools.jackson.module:jackson-module-kotlin")
	implementation("org.bouncycastle:bcprov-jdk18on:1.84")
	runtimeOnly("org.postgresql:postgresql")
	testImplementation("org.springframework.boot:spring-boot-starter-actuator-test")
	testImplementation("org.springframework.boot:spring-boot-starter-flyway-test")
	testImplementation("org.springframework.boot:spring-boot-starter-jdbc-test")
	testImplementation("org.springframework.boot:spring-boot-starter-validation-test")
	testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
	testImplementation("org.springframework.security:spring-security-test")
	testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

kotlin {
	sourceSets.named("main") {
		kotlin.srcDir(layout.buildDirectory.dir("generated/openapi/src/main/kotlin"))
	}

	compilerOptions {
		freeCompilerArgs.addAll("-Xjsr305=strict", "-Xannotation-default-target=param-property")
	}
}

openApiGenerate {
	generatorName.set("kotlin-spring")
	inputSpec.set(apiContractFile.absolutePath)
	outputDir.set(layout.buildDirectory.dir("generated/openapi").get().asFile.absolutePath)
	modelPackage.set("com.tree.api.model")
	globalProperties.set(
		mapOf(
			"models" to "",
			"modelDocs" to "false",
			"modelTests" to "false",
		),
	)
	configOptions.set(
		mapOf(
			"dateLibrary" to "java8",
			"documentationProvider" to "none",
			"generateJsonIncludeAnnotations" to "false",
			"generateJsonSetterNullsAnnotations" to "false",
			"serializationLibrary" to "jackson",
			"useBeanValidation" to "true",
			"useSpringBoot4" to "true",
		),
	)
}

openApiValidate {
	inputSpec.set(apiContractFile.absolutePath)
}

tasks.named("compileKotlin") {
	dependsOn("openApiGenerate")
}

tasks.withType<Test> {
	useJUnitPlatform()
}
