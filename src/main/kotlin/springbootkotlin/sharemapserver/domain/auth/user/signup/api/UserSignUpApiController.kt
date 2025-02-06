package springbootkotlin.sharemapserver.domain.auth.user.signup.api

import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import springbootkotlin.sharemapserver.domain.auth.user.service.UserAuthService
import springbootkotlin.sharemapserver.domain.auth.user.signup.api.req.UserSignUpRequest
import springbootkotlin.sharemapserver.domain.auth.user.signup.api.res.UserSignUpResponse
import springbootkotlin.sharemapserver.domain.auth.user.signup.service.UserSignUpService

@RestController
@RequestMapping("/api/auth/users/signup")
class UserSignUpApiController (
    private val userSignUpService: UserSignUpService,
    private val userAuthService: UserAuthService
) {
    @GetMapping("/check-username")
    fun checkUsername(@RequestParam username: String): ResponseEntity<Void> {
        userAuthService.checkUsernameDuplicate(username)
        return ResponseEntity.ok().build() // body 없이 반환 200
    }

    @GetMapping("/check-nickname")
    fun checkNickname(@RequestParam nickname: String): ResponseEntity<Void> {
        userAuthService.checkNicknameDuplicate(nickname)
        return ResponseEntity.ok().build()
    }

    @GetMapping("/check-email-address")
    fun checkEmail(@RequestParam emailAddress: String): ResponseEntity<Void> {
        userAuthService.checkEmailAddressDuplicate(emailAddress)
        return ResponseEntity.ok().build()
    }

    @PostMapping
    fun registerUser(
        @RequestBody
        @Valid
        userSignUpRequest: UserSignUpRequest
    ): ResponseEntity<UserSignUpResponse> {
        val user = userSignUpService.registerUser(userSignUpRequest)
        return ResponseEntity.ok(UserSignUpResponse.fromEntity(user))
    }
}