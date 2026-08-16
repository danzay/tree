package com.tree.app

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class TreeServerApplication

fun main(args: Array<String>) {
	runApplication<TreeServerApplication>(*args)
}
