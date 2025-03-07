package springbootkotlin.locationsserver.domain.user.view

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping

@Controller
@RequestMapping("")
class UserViewController {

    @GetMapping("/")
    fun index(): String {
        return "user/index"
    }

    @GetMapping("/group-list")
    fun groupList(): String {
        return "user/group-list"
    }

    @GetMapping("/user-profile")
    fun profile(): String {
        return "user/user-profile"
    }
}