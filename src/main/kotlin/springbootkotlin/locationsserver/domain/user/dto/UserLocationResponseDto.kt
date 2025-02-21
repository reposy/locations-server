package springbootkotlin.locationsserver.domain.user.dto

import java.time.LocalDateTime

data class UserLocationResponseDto(
    val id: Long?,
    val userId: Long,
    val latitude: Double,
    val longitude: Double,
    val timestamp: LocalDateTime
)