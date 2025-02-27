package springbootkotlin.locationsserver.domain.group.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import springbootkotlin.locationsserver.domain.group.entity.GroupInvitationToken
import springbootkotlin.locationsserver.domain.group.repository.GroupInvitationTokenRepository
import java.time.LocalDateTime
import java.util.*

@Service
@Transactional
class GroupInvitationTokenService(
    private val tokenRepository: GroupInvitationTokenRepository
) {
    // 토큰 생성 (예: 1회 사용, 24시간 유효)
    fun createToken(groupId: Long, fromUserId: Long, validHours: Long = 1, maxUses: Int = 1): GroupInvitationToken {
        val tokenValue = UUID.randomUUID().toString().replace("-", "")
        val expiresAt = LocalDateTime.now().plusHours(validHours)
        val token = GroupInvitationToken(token = tokenValue, groupId = groupId, fromUserId = fromUserId, expiresAt = expiresAt, maxUses = maxUses)
        return tokenRepository.save(token)
    }

    // GroupInvitationTokenService 내부에 추가
    fun findValidToken(tokenValue: String): GroupInvitationToken? {
        val now = LocalDateTime.now()
        val token = tokenRepository.findByTokenAndExpiresAtAfter(tokenValue, now)
        if (token == null || token.usedCount >= token.maxUses) {
            return null
        }
        return token
    }

    fun validateAndConsumeToken(tokenValue: String): GroupInvitationToken? {
        val now = LocalDateTime.now()
        val token = tokenRepository.findByTokenAndExpiresAtAfter(tokenValue, now)
            ?: return null  // 유효하지 않음
        if (token.usedCount >= token.maxUses) {
            return null  // 이미 사용됨
        }
        token.usedCount++
        tokenRepository.save(token)
        return token
    }
}