package springbootkotlin.locationsserver.domain.user.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import springbootkotlin.locationsserver.domain.user.entity.User
import springbootkotlin.locationsserver.domain.user.repository.UserRepository

@Service
class UserService(
    private val userRepository: UserRepository
) {

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
}