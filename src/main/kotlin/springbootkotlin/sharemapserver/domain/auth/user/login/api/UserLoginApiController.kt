package springbootkotlin.sharemapserver.domain.auth.user.login.api

import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import springbootkotlin.sharemapserver.domain.auth.user.session.UserSessionService
import springbootkotlin.sharemapserver.domain.auth.user.login.api.form.UserLoginForm
import springbootkotlin.sharemapserver.domain.auth.user.login.api.res.UserLoginResponse
import springbootkotlin.sharemapserver.domain.auth.user.service.UserAuthService

@RestController
@RequestMapping("/api/auth/login")
class UserLoginApiController(
    val userAuthService: UserAuthService,
    val sessionService: UserSessionService
) {

    @PostMapping("")
    fun userLogin(
        @Valid
        loginForm: UserLoginForm,
        session: HttpSession
    ): ResponseEntity<UserLoginResponse> {

        val user = userAuthService.authenticate(loginForm.userId, loginForm.userPassword)

        sessionService.setSession(session, user)

        return ResponseEntity.ok(
            UserLoginResponse(
                id = user.id,
                username = user.username,
                emailAddress = user.emailAddress,
                sessionExpiresAt = session.getAttribute("expires_at").toString()
            )
        )
    }
}