package springbootkotlin.sharemapserver.domain.auth.user.signin.api

import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import springbootkotlin.sharemapserver.domain.auth.user.session.UserSessionService
import springbootkotlin.sharemapserver.domain.auth.user.service.UserAuthService
import springbootkotlin.sharemapserver.domain.auth.user.signin.api.req.UserSignInRequest
import springbootkotlin.sharemapserver.domain.auth.user.signin.api.res.UserSignInResponse

@RestController
@RequestMapping("/api/auth/sign-in")
class UserSignInApiController(
    val userAuthService: UserAuthService,
    val sessionService: UserSessionService
) {

    @PostMapping("")
    fun userLogin(
        @RequestBody
        @Valid
        loginForm: UserSignInRequest,
        session: HttpSession
    ): ResponseEntity<UserSignInResponse> {
        println(loginForm)
        val user = userAuthService.authenticate(loginForm.username, loginForm.password)

        sessionService.setSession(session, user)

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