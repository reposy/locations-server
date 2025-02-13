package springbootkotlin.locationsserver.domain.location.api

import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import springbootkotlin.locationsserver.domain.auth.user.session.UserSessionService
import springbootkotlin.locationsserver.domain.location.api.req.LocationSaveRequest
import springbootkotlin.locationsserver.domain.location.api.res.LocationSaveResponse
import springbootkotlin.locationsserver.domain.location.entity.Location
import springbootkotlin.locationsserver.domain.location.service.LocationService

@RestController
@RequestMapping("/api/locations")
class LocationApiController(
    private val locationService: LocationService,
    private val sessionService: UserSessionService
) {
    // 📌 위치 저장 API (DTO 적용)
    @PostMapping
    fun saveLocation(@Valid
                     @RequestBody
                     request: LocationSaveRequest,
                     session: HttpSession
    ): ResponseEntity<LocationSaveResponse> {

        val userInfo = sessionService.getUserInfo(session)

        val savedLocation = locationService.saveLocation(request, userInfo.id)

        return ResponseEntity.ok(LocationSaveResponse.fromEntity(savedLocation))
    }

    // 📌 특정 사용자의 모든 위치 조회 API
    @GetMapping
    fun getUserLocations(session: HttpSession): ResponseEntity<List<Location>> {

        val userInfo = sessionService.getUserInfo(session)

        println("userInfo >>> $userInfo")
        val locations = locationService.getAllLocationsByUsers(userInfo.id)

        return ResponseEntity.ok(locations)
    }
}