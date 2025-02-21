package springbootkotlin.locationsserver.domain.user.api

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime
import springbootkotlin.locationsserver.domain.user.dto.SaveUserLocationDto
import springbootkotlin.locationsserver.domain.user.dto.UserLocationResponseDto
import springbootkotlin.locationsserver.domain.user.service.UserLocationService

@RestController
@RequestMapping("/api/users/{userId}/locations")
class UserLocationApiController(
    private val userLocationService: UserLocationService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun saveLocation(
        @PathVariable userId: Long,
        @RequestBody request: SaveUserLocationRequest
    ): UserLocationResponse {
        // Controller 내부에 정의된 Request를 별도의 DTO로 변환
        val dto = SaveUserLocationDto(
            latitude = request.latitude,
            longitude = request.longitude,
            timestamp = request.timestamp ?: LocalDateTime.now()
        )
        val responseDto: UserLocationResponseDto = userLocationService.saveLocation(dto, userId)
        return UserLocationResponse.fromDto(responseDto)
    }

    @GetMapping
    fun getLocations(@PathVariable userId: Long): List<UserLocationResponse> {
        val responseDtoList: List<UserLocationResponseDto> = userLocationService.getUserLocations(userId)
        return responseDtoList.map { UserLocationResponse.fromDto(it) }
    }

    // Controller 내에 Request, Response 클래스를 포함
    data class SaveUserLocationRequest(
        val latitude: Double,
        val longitude: Double,
        val timestamp: LocalDateTime? = null
    )

    data class UserLocationResponse(
        val id: Long?,
        val userId: Long,
        val latitude: Double,
        val longitude: Double,
        val timestamp: String
    ) {
        companion object {
            fun fromDto(dto: UserLocationResponseDto): UserLocationResponse {
                return UserLocationResponse(
                    id = dto.id,
                    userId = dto.userId,
                    latitude = dto.latitude,
                    longitude = dto.longitude,
                    timestamp = dto.timestamp.toString()
                )
            }
        }
    }
}