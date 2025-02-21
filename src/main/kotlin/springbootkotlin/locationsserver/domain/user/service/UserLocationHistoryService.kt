package springbootkotlin.locationsserver.domain.user.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import springbootkotlin.locationsserver.domain.user.entity.UserLocation
import springbootkotlin.locationsserver.domain.user.entity.UserLocationHistory
import springbootkotlin.locationsserver.domain.user.repository.UserLocationHistoryRepository

@Service
@Transactional
class UserLocationHistoryService(
    private val userLocationHistoryRepository: UserLocationHistoryRepository
) {

    /**
     * 기존 위치 기록을 업데이트합니다.
     */
    fun updateUserLocationHistory(historyId: Long, newLatitude: Double, newLongitude: Double): UserLocationHistory {
        val history = userLocationHistoryRepository.findById(historyId)
            .orElseThrow { IllegalArgumentException("User location history not found") }
        history.updateHistory(newLatitude, newLongitude)
        return userLocationHistoryRepository.save(history)
    }

    /**
     * 특정 사용자에 해당하는 모든 위치 기록을 조회합니다.
     */
    fun getLocationHistories(userId: Long): List<UserLocationHistory> {
        return userLocationHistoryRepository.findByUserId(userId)
    }

    /**
     * 새로운 위치 기록을 생성합니다.
     */
    fun createLocationHistory(locationHistory: UserLocationHistory): UserLocationHistory {
        return userLocationHistoryRepository.save(locationHistory)
    }

    fun createLocationHistoryByLocation(location: UserLocation): UserLocationHistory {
        val history = UserLocationHistory(
            user = location.user,
            latitude = location.latitude,
            longitude = location.longitude,
            timestamp = location.timestamp
        )
        return userLocationHistoryRepository.save(history)
    }
}