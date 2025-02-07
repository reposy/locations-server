package springbootkotlin.locationsserver.domain.auth.user.signin.api

import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import springbootkotlin.locationsserver.domain.auth.user.service.UserAuthService
import springbootkotlin.locationsserver.domain.auth.user.signin.api.req.UserSignInRequest
import springbootkotlin.locationsserver.domain.auth.user.signin.api.res.UserSignInResponse
import springbootkotlin.locationsserver.domain.auth.user.signin.service.UserSignInService

@RestController
@RequestMapping("/api/auth/users/signin")
class UserSignInApiController(
    private val userSignInService: UserSignInService,
    private val userAuthService: UserAuthService
) {

    @PostMapping("")
    fun userLogin(
        @RequestBody
        @Valid
        loginForm: UserSignInRequest,
        session: HttpSession
    ): ResponseEntity<UserSignInResponse> {

        val user = userAuthService.authenticate(loginForm.username, loginForm.password)

        userSignInService.userSignin(session, user)

        return ResponseEntity.ok(
            UserSignInResponse(
                id = user.id,
                username = user.username,
                emailAddress = user.emailAddress,
                sessionExpiresAt = session.getAttribute("expires_at").toString()
            )
        )
    }
}