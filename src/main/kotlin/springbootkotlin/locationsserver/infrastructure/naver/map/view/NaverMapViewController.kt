package springbootkotlin.locationsserver.infrastructure.naver.map.view

import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import springbootkotlin.locationsserver.config.properties.NaverMapProperties

@Controller
@RequestMapping("/naver/map")
class NaverMapViewController {

    @GetMapping("")
    fun getNaverMap(): String {
        return "/naver/map/naver-map"
    }
}