package springbootkotlin.locationsserver.infrastructure.naver.map.api

import jakarta.servlet.http.HttpServletResponse
import okhttp3.OkHttpClient
import okhttp3.Request
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import springbootkotlin.locationsserver.config.properties.NaverMapProperties
import springbootkotlin.locationsserver.infrastructure.naver.map.service.NaverMapService
import springbootkotlin.locationsserver.infrastructure.map.api.res.NaverGeocodeResponse

@RestController
@RequestMapping("/api/naver/map")
class NaverMapApiController(
    private val naverMapProperties: NaverMapProperties,
    private val naverMapService: NaverMapService,
    private val client: OkHttpClient
) {
    @GetMapping("/geocode")
    fun getGeocode(@RequestParam address: String): NaverGeocodeResponse? {
        return naverMapService.getGeocode(address)
    }

    @GetMapping("/proxy-maps")
    fun proxyNaverMapScript(response: HttpServletResponse) {
        val scriptUrl = "https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${naverMapProperties.clientId}?callback=initMap"

        val request = Request.Builder()
            .url(scriptUrl)
            .header("Referer", "http://localhost:8080") // 네이버 클라우드 콘솔에 등록된 URL 필요
            .build()

        client.newCall(request).execute().use { scriptResponse ->
            val responseBody = scriptResponse.body?.string() ?: ""

            // ✅ 네이버 API 응답을 로그로 출력
            println("🔍 네이버 API 응답 상태 코드: ${scriptResponse.code}")
            println("🔍 네이버 API 응답 본문: $responseBody")

            response.contentType = "application/javascript"
            response.writer.write(responseBody)
        }
    }
}