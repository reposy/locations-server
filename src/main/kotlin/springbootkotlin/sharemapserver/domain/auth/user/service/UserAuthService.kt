package springbootkotlin.sharemapserver.domain.auth.user.service

import org.springframework.stereotype.Service
import springbootkotlin.sharemapserver.domain.user.entity.User
import springbootkotlin.sharemapserver.domain.user.repository.UserRepository

@Service
class UserAuthService(
    private val userRepository: UserRepository
) {
    fun authenticate(username: String, password: String): User {

        val user = userRepository.findByUsername(username)
        if (user == null || password != user.password)
            throw IllegalArgumentException("입력된 정보로 로그인 할 수 없습니다.")

        return user
    }
}