package springbootkotlin.locationsserver.domain.location.service

import jakarta.servlet.http.HttpSession
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import springbootkotlin.locationsserver.domain.auth.user.session.UserSessionService
import springbootkotlin.locationsserver.domain.location.api.req.LocationSaveRequest
import springbootkotlin.locationsserver.domain.location.entity.Location
import springbootkotlin.locationsserver.domain.location.repository.LocationRepository

@Service
class LocationService(
    private val locationRepository: LocationRepository,
    private val sessionService: UserSessionService
) {
    // 위치 저장
    @Transactional
    fun saveLocation(request: LocationSaveRequest, session: HttpSession): Location {

        val userSession = sessionService.getUserInfo(session)
            ?: throw Exception("세션이 만료되었습니다.")

        if ( userSession.id == null )
            throw Exception("세션 id가 누락되어 있습니다.")

        val location = Location(
            nickname = request.nickname,
            address = request.address,
            detailAddress = request.detailAddress,
            roadName = request.roadName,
            latitude = request.latitude,
            longitude = request.longitude,
            createUserId = sessionService.getUserInfo(session)!!.id
        )
        return locationRepository.save(location)
    }

    // 사용자의 모든 위치 조회
    fun getAllLocationsByUsers(userId: Long): List<Location>? {
        return locationRepository.findByCreateUserIdOrderByIdDesc(userId)
    }
}