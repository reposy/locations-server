package springbootkotlin.locationsserver.domain.auth.user.signup.view

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping

@Controller
@RequestMapping("/users/signup")
class UserSignUpViewController {

    @GetMapping("")
    fun registerForm(): String {
        return "/auth/users/signup/signup-form"
    }
}