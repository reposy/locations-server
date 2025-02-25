package springbootkotlin.locationsserver.domain.user.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import springbootkotlin.locationsserver.domain.user.entity.User
import springbootkotlin.locationsserver.domain.user.repository.UserRepository
import java.time.LocalDateTime

@Service
class UserService(
    private val userRepository: UserRepository
) {

    @Transactional(readOnly = true)
    fun findById(userId: Long): User? = userRepository.findById(userId).orElse(null)

    @Transactional // ✅ 트랜잭션이 필요 (쓰기 작업)
    fun save(user: User): User = userRepository.save(user)

    @Transactional(readOnly = true) // ✅ 읽기 전용 트랜잭션 (성능 최적화)
    fun findByUsername(username: String): User? = userRepository.findByUsername(username)

    @Transactional(readOnly = true)
    fun existsByUsername(username: String): Boolean = userRepository.existsByUsername(username)

    @Transactional(readOnly = true)
    fun existsByNickname(nickname: String): Boolean = userRepository.existsByNickname(nickname)

    @Transactional(readOnly = true)
    fun existsByEmailAddress(emailAddress: String): Boolean = userRepository.existsByEmailAddress(emailAddress)

    /**
     * 사용자 로그인 시, 성공 시 마지막 로그인 시간을 업데이트합니다.
     * 실제 비밀번호 검증은 별도의 인증 로직이나 Security 프레임워크(예: Spring Security)에서 처리하는 것이 일반적입니다.
     */
    @Transactional
    fun updateLastLoginedAt(user: User): User {
        user.lastLoginedAt = LocalDateTime.now()
        return userRepository.save(user)
    }

    // 추가: 그룹에 속하지 않은 사용자를 검색하는 메서드
    @Transactional(readOnly = true)
    fun searchUsersNotInGroup(query: String, groupId: Long, currentUserId: Long): List<User> {
        return userRepository.searchUsersNotInGroup(query, currentUserId, groupId)
    }
}