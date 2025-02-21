package springbootkotlin.locationsserver.domain.user.api

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime
import springbootkotlin.locationsserver.domain.user.entity.UserLocationHistory
import springbootkotlin.locationsserver.domain.user.service.UserLocationHistoryService
import springbootkotlin.locationsserver.domain.user.service.UserService

@RestController
@RequestMapping("/api/users/{userId}/location-histories")
class UserLocationHistoryApiController(
    private val userLocationHistoryService: UserLocationHistoryService,
    private val userService: UserService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createLocationHistory(
        @PathVariable userId: Long,
        @RequestBody request: CreateUserLocationHistoryRequest
    ): UserLocationHistoryResponse {
        // User 엔티티 조회
        val user = userService.findById(userId)
            ?: throw IllegalArgumentException("User not found with id: $userId")
        // UserLocationHistory 엔티티 생성 (timestamp가 없으면 현재 시간 사용)
        val history = UserLocationHistory(
            user = user,
            latitude = request.latitude,
            longitude = request.longitude,
            timestamp = request.timestamp ?: LocalDateTime.now()
        )
        val savedHistory = userLocationHistoryService.createLocationHistory(history)
        return UserLocationHistoryResponse.fromEntity(savedHistory)
    }

    @GetMapping
    fun getLocationHistories(@PathVariable userId: Long): List<UserLocationHistoryResponse> {
        val histories = userLocationHistoryService.getLocationHistories(userId)
        return histories.map { UserLocationHistoryResponse.fromEntity(it) }
    }

    @PutMapping("/{historyId}")
    fun updateLocationHistory(
        @PathVariable userId: Long,
        @PathVariable historyId: Long,
        @RequestBody request: UpdateUserLocationHistoryRequest
    ): UserLocationHistoryResponse {
        val updatedHistory = userLocationHistoryService.updateUserLocationHistory(
            historyId,
            request.newLatitude,
            request.newLongitude
        )
        return UserLocationHistoryResponse.fromEntity(updatedHistory)
    }

    // Controller 내부에 정의된 Request DTO
    data class CreateUserLocationHistoryRequest(
        val latitude: Double,
        val longitude: Double,
        val timestamp: LocalDateTime? = null
    )

    data class UpdateUserLocationHistoryRequest(
        val newLatitude: Double,
        val newLongitude: Double
    )

    // Controller 내부에 정의된 Response DTO
    data class UserLocationHistoryResponse(
        val id: Long?,
        val userId: Long,
        val latitude: Double,
        val longitude: Double,
        val timestamp: String
    ) {
        companion object {
            fun fromEntity(entity: UserLocationHistory): UserLocationHistoryResponse {
                return UserLocationHistoryResponse(
                    id = entity.id,
                    userId = entity.user.id,
                    latitude = entity.latitude,
                    longitude = entity.longitude,
                    timestamp = entity.timestamp.toString()
                )
            }
        }
    }
}