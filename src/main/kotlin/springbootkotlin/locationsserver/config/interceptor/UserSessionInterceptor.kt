package springbootkotlin.locationsserver.config.interceptor

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor
import springbootkotlin.locationsserver.domain.auth.user.session.UserSessionService

@Component
class UserSessionInterceptor(
    private val sessionService: UserSessionService
) : HandlerInterceptor {

    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any
    ): Boolean {
        val session = request.session
        if (!sessionService.isSessionValid(session)) {
            response.sendRedirect("/users/signin")
            return false
        }
        // 유효한 세션이 존재한다면, 만료 시간 연장
        sessionService.extendSession(session)
        return true
    }
}