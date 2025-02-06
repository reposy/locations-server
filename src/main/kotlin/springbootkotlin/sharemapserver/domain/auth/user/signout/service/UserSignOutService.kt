package springbootkotlin.sharemapserver.domain.auth.user.signout.service

import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Service
import springbootkotlin.sharemapserver.domain.auth.user.session.UserSessionService

@Service
class UserSignOutService(
    private val sessionService: UserSessionService
) {

    fun userSignOut(request: HttpServletRequest) {
        val session = request.getSession(false) // false -> 새로 세션을 생성하지 않음
        sessionService.invalidateSession(session)
    }
}