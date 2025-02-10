package springbootkotlin.locationsserver.config.interceptor

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor
import springbootkotlin.locationsserver.config.exception.user.UserSessionExpiredException
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
            val isApiRequest = request.requestURI.startsWith("/api/")

            if (isApiRequest) {
                // 📌 API 요청: 401 UNAUTHORIZED 응답 (JSON 반환)
                response.status = HttpServletResponse.SC_UNAUTHORIZED
                response.contentType = "application/json"
                response.characterEncoding = "UTF-8"
                response.writer.write("""{"error": "세션 만료", "message": "로그인이 필요합니다."}""")
            } else {
                // 📌 웹 요청: 로그인 페이지로 Redirect
                response.sendRedirect("/users/signin")
            }
            return false
        }

        // 유효한 세션이면 세션 연장
        sessionService.extendSession(session)
        return true
    }
}