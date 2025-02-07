package springbootkotlin.locationsserver.domain.auth.user.signup.service

import org.springframework.stereotype.Service
import springbootkotlin.locationsserver.domain.auth.user.service.UserAuthService
import springbootkotlin.locationsserver.domain.auth.user.signup.api.req.UserSignUpRequest
import springbootkotlin.locationsserver.domain.user.entity.User
import springbootkotlin.locationsserver.domain.user.service.UserService

@Service
class UserSignUpService(
    private val userService: UserService,
    private val userAuthService: UserAuthService
) {

    fun registerUser(userSignUpRequest: UserSignUpRequest): User {

        userAuthService.validateUserUniqueness(
            userSignUpRequest.username,
            userSignUpRequest.nickname,
            userSignUpRequest.emailAddress
        ) // ✅ 중복 체크 일괄 수행

        // 비밀번호 해싱 후 저장
        //val hashedPassword = userAuthService.encodePassword(password)
        //val newUser = User(username, nickname, emailAddress, hashedPassword)
        val newUser = User(
            username = userSignUpRequest.username,
            password = userSignUpRequest.password,
            nickname = userSignUpRequest.nickname,
            emailAddress = userSignUpRequest.emailAddress
        )
        return userService.save(newUser)
    }
}