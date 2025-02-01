package springbootkotlin.sharemapserver

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class SharemapServerApplication

fun main(args: Array<String>) {
    runApplication<SharemapServerApplication>(*args)
}
