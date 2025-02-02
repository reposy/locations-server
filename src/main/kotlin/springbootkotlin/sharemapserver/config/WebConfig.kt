package springbootkotlin.sharemapserver.config

import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import springbootkotlin.sharemapserver.config.interceptor.UserSessionInterceptor

@Configuration
class WebConfig(
    private val sessionInterceptor: UserSessionInterceptor
) : WebMvcConfigurer {

    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(sessionInterceptor)
            .addPathPatterns("/api/**") // ✅ 인증이 필요한 API만 Interceptor 적용
            .excludePathPatterns(
                "/api/auth/login",
                "/api/auth/signup"
            )
    }
}