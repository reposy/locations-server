package springbootkotlin.locationsserver.infrastructure.config

import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import springbootkotlin.locationsserver.infrastructure.config.interceptor.UserSessionInterceptor

@Configuration
class WebConfig(
    private val sessionInterceptor: UserSessionInterceptor
) : WebMvcConfigurer {

    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(sessionInterceptor)
            .addPathPatterns("/**")
            .excludePathPatterns(
                "/api/guest/**",
                "/guest/**",
                "/users/signin/**",
                "/users/signup/**",
                "/api/auth/users/signin/**",
                "/api/auth/users/signup/**",
                "/api/auth/users/signout/**",

                "/js/**",     // JavaScript 정적 리소스
                "/css/**",    // CSS 정적 리소스
                "/images/**", // 이미지 정적 리소스
                "/static/**", // 기타 정적 리소스
                "/error"      // Spring Boot 에러 핸들러
            )
    }
}