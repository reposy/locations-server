package springbootkotlin.locationsserver.domain.user.repository

import org.springframework.data.jpa.repository.JpaRepository
import springbootkotlin.locationsserver.domain.user.entity.UserLocationHistory

interface UserLocationHistoryRepository : JpaRepository<UserLocationHistory, Long> {
    fun findByUserId(userId: Long): List<UserLocationHistory>
}