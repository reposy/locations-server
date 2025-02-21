package springbootkotlin.locationsserver.domain.user.dto

import java.time.LocalDateTime

data class SaveUserLocationDto(
    val latitude: Double,
    val longitude: Double,
    val timestamp: LocalDateTime
)