package springbootkotlin.locationsserver.domain.user.view

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping

@Controller
@RequestMapping("")
class UserViewController {

    @GetMapping("/")
    fun index(): String {
        return "/user/index"
    }

    @GetMapping("/group-list")
    fun groupList(): String {
        return "/user/group-list"
    }

    @GetMapping("/profile")
    fun profilePage(): String {
        return "/user/profile"
    }

    @GetMapping("/invitations")
    fun invitationListPage(): String {
        return "/user/invitations/invitation-list"
    }
}