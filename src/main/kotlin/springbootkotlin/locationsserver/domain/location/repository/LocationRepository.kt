package springbootkotlin.locationsserver.domain.location.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import springbootkotlin.locationsserver.domain.location.entity.Location

@Repository
interface LocationRepository : JpaRepository<Location, Long> {
    fun findByCreateUserIdOrderByIdDesc(userId: Long): List<Location>
}