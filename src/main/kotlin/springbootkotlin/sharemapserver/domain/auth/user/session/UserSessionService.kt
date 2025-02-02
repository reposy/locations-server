package springbootkotlin.sharemapserver.domain.auth.user.session

import jakarta.servlet.http.HttpSession
import org.springframework.stereotype.Service
import springbootkotlin.sharemapserver.domain.user.entity.User
import java.time.ZoneId
import java.time.ZonedDateTime

@Service
class UserSessionService {

    private val SESSION_VALID_MINUTES = 30L

    fun setSession(session: HttpSession, user: User): User {
        session.setAttribute("USER", user)
        extendSession(session)
        return user
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