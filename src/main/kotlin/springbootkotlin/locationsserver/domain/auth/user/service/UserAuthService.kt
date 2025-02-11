package springbootkotlin.locationsserver.domain.auth.user.service

import org.springframework.stereotype.Service
import springbootkotlin.locationsserver.infrastructure.config.exception.user.DuplicateUserException
import springbootkotlin.locationsserver.domain.user.entity.User
import springbootkotlin.locationsserver.domain.user.service.UserService

@Service
class UserAuthService(
    val userService: UserService,
) {
    companion object {
        private const val USER_SIGN_IN_FAILED_MESSAGE = "아이디가 존재하지 않거나 비밀번호가 일치하지 않습니다."
        private const val USER_DUPLICATE_USERNAME_MESSAGE = "이미 존재하는 아이디입니다."
        private const val USER_DUPLICATE_NICKNAME_MESSAGE = "이미 존재하는 별명입니다."
        private const val USER_DUPLICATE_EMAIL_MESSAGE = "이미 존재하는 이메일입니다."
    }

    fun authenticate(username: String, password: String): User {

        val user = userService.findByUsername(username)
            ?: throw IllegalArgumentException(USER_SIGN_IN_FAILED_MESSAGE)

        if (!user.password.equals(password))
            throw IllegalArgumentException(USER_SIGN_IN_FAILED_MESSAGE)

        return user
    }

    fun validateUserUniqueness(username: String, nickname: String, emailAddress: String) {
        checkUsernameDuplicate(username)
        checkNicknameDuplicate(nickname)
        checkEmailAddressDuplicate(emailAddress)
    }

    fun checkUsernameDuplicate(username: String) {
        if (userService.existsByUsername(username)) {
            throw DuplicateUserException(USER_DUPLICATE_USERNAME_MESSAGE)
        }
    }

    fun checkNicknameDuplicate(nickname: String) {
        if (userService.existsByNickname(nickname)) {
            throw DuplicateUserException(USER_DUPLICATE_NICKNAME_MESSAGE)
        }
    }

    fun checkEmailAddressDuplicate(emailAddress: String) {
        if (userService.existsByEmailAddress(emailAddress)) {
            throw DuplicateUserException(USER_DUPLICATE_EMAIL_MESSAGE)
        }
    }
}