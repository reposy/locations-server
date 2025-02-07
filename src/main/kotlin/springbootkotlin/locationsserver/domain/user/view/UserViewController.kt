package springbootkotlin.locationsserver.domain.user.view

import jakarta.servlet.http.HttpSession
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import springbootkotlin.locationsserver.config.properties.NaverMapProperties
import springbootkotlin.locationsserver.domain.auth.user.session.UserSessionService

@Controller
@RequestMapping("")
class UserViewController(
    private val sessionService: UserSessionService,
    private val naverMapProperties: NaverMapProperties
) {

    @GetMapping("")
    fun home (session: HttpSession, model: Model): String {

        val userInfo = sessionService.getUserInfo(session)
        model.addAttribute("user", userInfo)
        model.addAttribute("clientId", naverMapProperties.clientId)
        return "/users/index"
    }
}