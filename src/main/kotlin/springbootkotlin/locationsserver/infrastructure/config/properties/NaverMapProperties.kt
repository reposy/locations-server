package springbootkotlin.locationsserver.infrastructure.config.properties

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "naver.map")
class NaverMapProperties {
    lateinit var clientId: String
    lateinit var clientSecret: String
}