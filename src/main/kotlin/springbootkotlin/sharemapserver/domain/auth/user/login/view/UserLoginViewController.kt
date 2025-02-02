package springbootkotlin.sharemapserver.domain.auth.user.login.view

import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping

@Controller
@RequestMapping("/users/login")
class UserLoginViewController {

    @GetMapping("")
    fun loginPage(
        model: Model
    ): String {
        return "/users/login" // ✅ `login.html` 뷰 반환
    }
}