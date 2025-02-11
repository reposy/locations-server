package springbootkotlin.locationsserver.domain.auth.user.session

import jakarta.servlet.http.HttpSession
import org.springframework.stereotype.Service
import springbootkotlin.locationsserver.infrastructure.config.exception.user.UserSessionExpiredException
import springbootkotlin.locationsserver.domain.auth.user.dto.UserInfoDTO
import java.time.ZoneId
import java.time.ZonedDateTime

@Service
class UserSessionService {

    private val SESSION_VALID_MINUTES = 30L

    fun setUserInfo(session: HttpSession, userInfo: UserInfoDTO): UserInfoDTO {
        session.setAttribute("USER", userInfo)
        extendSession(session)
        return userInfo
    }

    fun getUserInfo(session: HttpSession): UserInfoDTO {
        val userInfo = session.getAttribute("USER") as? UserInfoDTO
            ?: throw UserSessionExpiredException("세션이 만료되었습니다. 다시 로그인해주세요.")

        if (!isSessionValid(session)) {
            invalidateSession(session)
            throw UserSessionExpiredException("세션이 만료되었습니다. 다시 로그인해주세요.")
        }

        extendSession(session)
        return userInfo
    }

    fun isSessionValid(session: HttpSession): Boolean {
        val expiresAt = session.getAttribute("expires_at") as? ZonedDateTime ?: return false
        return ZonedDateTime.now(ZoneId.of("UTC")).isBefore(expiresAt) // ✅ UTC 기준 비교
    }

    fun extendSession(session: HttpSession) {
        val newExpiresAt = ZonedDateTime.now(ZoneId.of("UTC"))
            .plusMinutes(SESSION_VALID_MINUTES) // ✅ UTC 기준으로 설정
        session.setAttribute("expires_at", newExpiresAt)
    }

    fun invalidateSession(session: HttpSession) {
        session.invalidate()
    }
}