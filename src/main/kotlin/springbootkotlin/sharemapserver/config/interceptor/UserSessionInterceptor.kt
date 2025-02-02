package springbootkotlin.sharemapserver.config.interceptor

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor
import springbootkotlin.sharemapserver.domain.auth.user.session.UserSessionService

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
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "세션이 만료되었습니다. 다시 로그인하세요.")
            return false
        }

        sessionService.extendSession(session)
        return true
    }
}