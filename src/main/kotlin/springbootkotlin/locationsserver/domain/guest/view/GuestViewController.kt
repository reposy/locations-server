package springbootkotlin.locationsserver.domain.guest.view

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping

@Controller
@RequestMapping("/guest")
class GuestViewController {

    @GetMapping
    fun index(): String {
        return "guest/guest-index"
    }

    @GetMapping("/guest-group-detail")
    fun guestGroupDetail(): String {
        return "guest/guest-group-detail"
    }

}