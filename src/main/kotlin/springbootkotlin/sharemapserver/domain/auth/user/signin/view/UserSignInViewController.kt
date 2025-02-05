package springbootkotlin.sharemapserver.domain.auth.user.signin.view

import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping

@Controller
@RequestMapping("/users/login")
class UserSignInViewController {

    @GetMapping("")
    fun loginPage(model: Model): String {
        return "/auth/users/sign-in-form" // ✅ `sign-in-form.html` 뷰 반환
    }
}