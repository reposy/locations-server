package springbootkotlin.locationsserver.infrastructure.naver.map.view

import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import springbootkotlin.locationsserver.config.properties.NaverMapProperties

@Controller
@RequestMapping("/naver-map")
class NaverMapViewController(
    private val naverMapProperties: NaverMapProperties
) {

    @GetMapping("")
    fun getNaverMap(model: Model): String {
        model.addAttribute("clientId", naverMapProperties.clientId)
        return "/naver/map/naver-map"
    }
}