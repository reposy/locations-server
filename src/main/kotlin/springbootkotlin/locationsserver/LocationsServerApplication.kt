package springbootkotlin.locationsserver

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class LocationsServerApplication

fun main(args: Array<String>) {
    runApplication<LocationsServerApplication>(*args)
}