package springbootkotlin.locationsserver.infrastructure.config

import okhttp3.OkHttpClient
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.util.concurrent.TimeUnit

@Configuration
class OkHttpClientConfig {

    @Bean
    fun okHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)  // 연결 타임아웃 설정
            .readTimeout(10, TimeUnit.SECONDS)     // 읽기 타임아웃 설정
            .writeTimeout(10, TimeUnit.SECONDS)    // 쓰기 타임아웃 설정
            .build()
    }
}