package springbootkotlin.sharemapserver.domain.auth.user.signout.api

import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import springbootkotlin.sharemapserver.domain.auth.user.signout.api.res.UserSignOutResponse
import springbootkotlin.sharemapserver.domain.auth.user.signout.service.UserSignOutService

@RestController
@RequestMapping("/api/auth/users/signout")
class UserSignOutApiController(
    private val userSignOutService: UserSignOutService
) {

    @PostMapping("")
    fun userSignOut(request: HttpServletRequest): ResponseEntity<UserSignOutResponse> {

        userSignOutService.userSignOut(request)

        return ResponseEntity.ok(UserSignOutResponse("로그아웃이 완료되었습니다."))
    }
}