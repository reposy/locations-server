package springbootkotlin.locationsserver.infrastructure.naver.map.api

import okhttp3.OkHttpClient
import okhttp3.Request
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import springbootkotlin.locationsserver.config.properties.NaverMapProperties
import springbootkotlin.locationsserver.infrastructure.naver.map.api.res.NaverMapApiResponse

@RestController
@RequestMapping("/api/naver/map")
class NaverMapApiController(
    private val httpClient: OkHttpClient,
    private val naverMapProperties: NaverMapProperties,

    ) {
    @GetMapping("/client-id")
    fun getClientId(): ResponseEntity<NaverMapApiResponse> {
        return ResponseEntity.ok(
            NaverMapApiResponse(naverMapProperties.clientId)
        )
    }

    @GetMapping("/reverse-geocode")
    fun getAddress(
        @RequestParam lat: Double,
        @RequestParam lng: Double
    ): ResponseEntity<String> {
        val url = "https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc" +
                "?coords=$lng,$lat&sourcecrs=EPSG:4326&orders=roadaddr&output=json"

        val request = Request.Builder()
            .url(url)
            .addHeader("X-NCP-APIGW-API-KEY-ID", naverMapProperties.clientId)
            .addHeader("X-NCP-APIGW-API-KEY", naverMapProperties.clientSecret)
            .get()
            .build()

        return try {
//            httpClient.newCall(request).execute().use { response ->
//                println(response.body)
//                if (!response.isSuccessful) {
//                    throw RuntimeException("📌 네이버 Reverse Geocoding API 호출 실패: ${response.code}")
//                }
//                ResponseEntity.ok(response.body?.string() ?: "주소 없음")
//            }
//            .region.area1.name
            ResponseEntity.ok(
                """
{
    "status": {
        "code": 0,
        "name": "ok",
        "message": "done"
    },
    "results": [
        {
            "name": "roadaddr",
            "code": {
                "id": "ROAD_NAME",
                "type": "string",
                "mapping": "roadaddr"
            },
            "region": {
                "area0": {
                    "name": "KR",
                    "coords": {
                        "center": {
                            "crs": "EPSG:4326",
                            "x": 127.105399,
                            "y": 37.3595704
                        }
                    }
                },
                "area1": {
                    "name": "경기도",
                    "coords": {
                        "center": {
                            "crs": "EPSG:4326",
                            "x": 127.105399,
                            "y": 37.3595704
                        }
                    }
                },
                "area2": {
                    "name": "성남시 분당구",
                    "coords": {
                        "center": {
                            "crs": "EPSG:4326",
                            "x": 127.105399,
                            "y": 37.3595704
                        }
                    }
                },
                "area3": {
                    "name": "정자동",
                    "coords": {
                        "center": {
                            "crs": "EPSG:4326",
                            "x": 127.105399,
                            "y": 37.3595704
                        }
                    }
                }
            },
            "land": {
                "name": "정자일로",
                "number1": "95",
                "number2": "1",
                "addition0": {
                    "type": "BLDG",
                    "value": "NAVER 그린팩토리"
                },
                "coords": {
                    "center": {
                        "crs": "EPSG:4326",
                        "x": 127.105399,
                        "y": 37.3595704
                    }
                }
            }
        }
    ]
}
                    }]
            """.trimIndent()
            )
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("📌 서버에서 주소 변환 요청 중 오류 발생: ${e.message}")
        }
    }

}