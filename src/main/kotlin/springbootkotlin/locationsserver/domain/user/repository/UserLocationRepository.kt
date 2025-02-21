package springbootkotlin.locationsserver.domain.user.repository

import org.springframework.data.jpa.repository.JpaRepository
import springbootkotlin.locationsserver.domain.user.entity.UserLocation

interface UserLocationRepository : JpaRepository<UserLocation, Long> {
    fun findByUserId(userId: Long): List<UserLocation>
}