package springbootkotlin.locationsserver.domain.auth.user.signin.service

import jakarta.servlet.http.HttpSession
import org.springframework.stereotype.Service
import springbootkotlin.locationsserver.domain.auth.user.dto.UserInfoDTO
import springbootkotlin.locationsserver.domain.auth.user.session.UserSessionService
import springbootkotlin.locationsserver.domain.user.entity.User

@Service
class UserSignInService(
    private val sessionService: UserSessionService
) {

    fun userSignin(session: HttpSession, user: User) {
        sessionService.setUserInfo(session, UserInfoDTO.fromEntity(user))
    }
}