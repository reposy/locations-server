package springbootkotlin.locationsserver.domain.location.api.res

import springbootkotlin.locationsserver.domain.location.entity.Location
import java.time.LocalDateTime

data class LocationSaveResponse(
    val id: Long,
    val userId: Long,
    val nickname: String,
    val address: String?,
    val detailAddress: String?,
    val roadName: String?,
    val createdAt: LocalDateTime,
) {
    companion object {
        fun fromEntity(location: Location): LocationSaveResponse {
            return LocationSaveResponse(
                id = location.id,
                userId = location.createUserId,
                nickname = location.nickname,
                address = location.address,
                detailAddress = location.detailAddress,
                roadName = location.roadName,
                createdAt = location.createdAt,
            )
        }
    }
}