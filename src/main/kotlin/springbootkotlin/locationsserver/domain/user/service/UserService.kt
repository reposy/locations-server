package springbootkotlin.locationsserver.domain.user.service

import jakarta.servlet.http.HttpSession
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import springbootkotlin.locationsserver.domain.auth.user.session.UserSessionService
import springbootkotlin.locationsserver.domain.user.entity.User
import springbootkotlin.locationsserver.domain.user.repository.UserRepository
import java.time.LocalDateTime

@Service
class UserService(
    private val userRepository: UserRepository,
    private val sessionService: UserSessionService
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

    @Transactional
    fun updateNickname(userId: Long, newNickname: String, session: HttpSession): User {
        val userInfo = sessionService.getUserInfo(session)
        if (userId != userInfo.id) {
            throw IllegalArgumentException("자신의 프로필만 수정할 수 있습니다.")
        }
        val user = findById(userId) ?: throw IllegalArgumentException("User not found with id: $userId")

        // 기존 값과 동일한지 확인
        if (user.nickname == newNickname) {
            throw IllegalArgumentException("새 별명이 기존 별명과 동일합니다.")
        }
        // 다른 사용자에게 이미 사용 중인 별명인지 확인 (본인 제외)
        if (userRepository.existsByNicknameAndIdNot(newNickname, userId)) {
            throw IllegalArgumentException("해당 별명은 이미 사용 중입니다.")
        }

        user.nickname = newNickname
        return userRepository.save(user)
    }

    @Transactional
    fun updateEmail(userId: Long, newEmail: String, session: HttpSession): User {
        val userInfo = sessionService.getUserInfo(session)
        if (userId != userInfo.id) {
            throw IllegalArgumentException("자신의 프로필만 수정할 수 있습니다.")
        }
        val user = findById(userId) ?: throw IllegalArgumentException("User not found with id: $userId")

        if (user.emailAddress == newEmail) {
            throw IllegalArgumentException("새 이메일이 기존 이메일과 동일합니다.")
        }
        // 다른 사용자에게 이미 사용 중인 이메일인지 확인 (본인 제외)
        if (userRepository.existsByEmailAddressAndIdNot(newEmail, userId)) {
            throw IllegalArgumentException("해당 이메일은 이미 사용 중입니다.")
        }

        user.emailAddress = newEmail
        return userRepository.save(user)
    }

    @Transactional
    fun updatePassword(userId: Long, newPassword: String, session: HttpSession): User {
        val userInfo = sessionService.getUserInfo(session)

        if (userId != userInfo.id) {
            throw IllegalArgumentException("자신의 프로필만 수정할 수 있습니다.")
        }
        val user = findById(userId) ?: throw IllegalArgumentException("User not found with id: $userId")

        if (user.password == newPassword) {
            throw IllegalArgumentException("새 비밀번호가 기존 비밀번호와 동일합니다.")
        }

        // 비밀번호 암호화 로직이 추가되어야 할 수도 있습니다.
        user.password = newPassword
        return userRepository.save(user)
    }
}