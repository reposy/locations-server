package springbootkotlin.locationsserver.domain.location.api

import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import springbootkotlin.locationsserver.domain.location.api.req.LocationSaveRequest
import springbootkotlin.locationsserver.domain.location.api.res.LocationSaveResponse
import springbootkotlin.locationsserver.domain.location.entity.Location
import springbootkotlin.locationsserver.domain.location.service.LocationService

@RestController
@RequestMapping("/api/locations")
class LocationController(
    private val locationService: LocationService
) {
    // 📌 위치 저장 API (DTO 적용)
    @PostMapping
    fun saveLocation(@Valid
                     @RequestBody
                     request: LocationSaveRequest,
                     session: HttpSession
    ): ResponseEntity<LocationSaveResponse> {

        val savedLocation = locationService.saveLocation(request, session)

        return ResponseEntity.ok(LocationSaveResponse.fromEntity(savedLocation))
    }

    // 📌 특정 사용자의 모든 위치 조회 API
    @GetMapping("/{userId}")
    fun getUserLocations(@PathVariable userId: Long): ResponseEntity<List<Location>?> {
        val locations = locationService.getAllLocationsByUsers(userId)
        return ResponseEntity.ok(locations)
    }
}