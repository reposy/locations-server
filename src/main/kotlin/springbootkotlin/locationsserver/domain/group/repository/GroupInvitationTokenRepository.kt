package springbootkotlin.locationsserver.domain.group.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import springbootkotlin.locationsserver.domain.group.entity.GroupInvitationToken
import java.time.LocalDateTime

@Repository
interface GroupInvitationTokenRepository : JpaRepository<GroupInvitationToken, Long> {
    // 유효한 토큰인지 (만료되지 않고 사용 제한 내) 확인하는 메서드
    fun findByTokenAndExpiresAtAfter(token: String, now: LocalDateTime): GroupInvitationToken?
}