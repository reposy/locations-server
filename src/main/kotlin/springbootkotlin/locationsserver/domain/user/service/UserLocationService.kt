package springbootkotlin.locationsserver.domain.user.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import springbootkotlin.locationsserver.domain.user.dto.SaveUserLocationDto
import springbootkotlin.locationsserver.domain.user.dto.UserLocationResponseDto
import springbootkotlin.locationsserver.domain.user.entity.UserLocation
import springbootkotlin.locationsserver.domain.user.repository.UserLocationRepository

@Service
@Transactional
class UserLocationService(
    private val userService: UserService,
    private val userLocationRepository: UserLocationRepository,
    private val userLocationHistoryService: UserLocationHistoryService  // 새로 추가된 의존성
) {

    /**
     * SaveUserLocationDto를 받아 UserLocation 엔티티를 생성 및 저장하고,
     * 위치 이력도 함께 기록한 후 결과를 UserLocationResponseDto로 반환합니다.
     */
    fun saveLocation(dto: SaveUserLocationDto, userId: Long): UserLocationResponseDto {
        val user = userService.findById(userId)
            ?: throw IllegalArgumentException("User not found with id: $userId")
        val location = UserLocation(
            user = user,
            group = null, // group 정보가 필요한 경우 별도 처리
            latitude = dto.latitude,
            longitude = dto.longitude,
            timestamp = dto.timestamp
        )
        val savedLocation = userLocationRepository.save(location)
        // 이력 저장
        userLocationHistoryService.createLocationHistoryByLocation(savedLocation)
        return UserLocationResponseDto(
            id = savedLocation.id,
            userId = savedLocation.user.id,
            latitude = savedLocation.latitude,
            longitude = savedLocation.longitude,
            timestamp = savedLocation.timestamp
        )
    }

    /**
     * 특정 사용자에 해당하는 모든 위치 기록을 조회합니다.
     */
    fun getUserLocations(userId: Long): List<UserLocationResponseDto> {
        return userLocationRepository.findByUserId(userId).map { location ->
            UserLocationResponseDto(
                id = location.id,
                userId = location.user.id,
                latitude = location.latitude,
                longitude = location.longitude,
                timestamp = location.timestamp
            )
        }
    }

    // updateUserLocation 및 createUserLocation 메서드는 기존 코드 유지
}