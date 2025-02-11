package springbootkotlin.locationsserver.infrastructure.external.naver.map.view

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping

@Controller
@RequestMapping("/naver/map")
class NaverMapViewController {

    @GetMapping("")
    fun getNaverMap(): String {
        return "/naver/map/naver-map"
    }
}