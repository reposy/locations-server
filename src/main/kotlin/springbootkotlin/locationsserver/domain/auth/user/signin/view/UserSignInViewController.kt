package springbootkotlin.locationsserver.domain.auth.user.signin.view

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping

@Controller
@RequestMapping("/users/signin")
class UserSignInViewController {

    @GetMapping("")
    fun signInPage(): String {
        return "auth/user/signin/signin-form" // ✅ `signin-form.html` 뷰 반환
    }
}