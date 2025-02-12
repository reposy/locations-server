package springbootkotlin.locationsserver.domain.location.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import springbootkotlin.locationsserver.domain.location.api.req.LocationSaveRequest
import springbootkotlin.locationsserver.domain.location.entity.Location
import springbootkotlin.locationsserver.domain.location.repository.LocationRepository

@Service
class LocationService(
    private val locationRepository: LocationRepository,
) {
    // 위치 저장
    @Transactional
    fun saveLocation(request: LocationSaveRequest, userId: Long): Location {
        return locationRepository.save(
            Location(
                nickname = request.nickname,
                address = request.address,
                detailAddress = request.detailAddress,
                roadName = request.roadName,
                latitude = request.latitude,
                longitude = request.longitude,
                markerColor = request.markerColor,
                markerType = request.markerType,
                createUserId = userId,
        ))
    }

    // 사용자의 모든 위치 조회
    fun getAllLocationsByUsers(userId: Long): List<Location> {
        return locationRepository.findByCreateUserIdOrderByIdDesc(userId)
    }
}