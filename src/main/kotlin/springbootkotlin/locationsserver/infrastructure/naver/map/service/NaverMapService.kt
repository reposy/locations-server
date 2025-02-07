package springbootkotlin.locationsserver.infrastructure.naver.map.service

import okhttp3.*
import org.springframework.stereotype.Service
import springbootkotlin.locationsserver.config.properties.NaverMapProperties
import com.fasterxml.jackson.databind.ObjectMapper
import springbootkotlin.locationsserver.infrastructure.map.api.res.NaverGeocodeResponse

@Service
class NaverMapService(
    private val okHttpClient: OkHttpClient,
    private val objectMapper: ObjectMapper,  // ✅ 의존성 주입
    private val naverMapProperties: NaverMapProperties
) {
    private val naverApiBaseUrl = "https://naveropenapi.apigw.ntruss.com"

    fun getGeocode(address: String): NaverGeocodeResponse? {
        val url = "$naverApiBaseUrl/map-geocode/v2/geocode?query=$address"

        val request = Request.Builder()
            .url(url)
            .addHeader("X-NCP-APIGW-API-KEY-ID", naverMapProperties.clientId)
            .addHeader("X-NCP-APIGW-API-KEY", naverMapProperties.clientSecret)
            .build()

        okHttpClient.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw RuntimeException("네이버 지도 API 요청 실패: ${response.code}")
            }
            return response.body?.string()?.let { objectMapper.readValue(it, NaverGeocodeResponse::class.java) }
        }
    }
}