package springbootkotlin.locationsserver.domain.user.entity

import jakarta.persistence.*
import java.time.LocalDateTime
import springbootkotlin.locationsserver.infrastructure.config.entity.AuditableEntity

@Entity
@Table(name = "user_location_history")
class UserLocationHistory(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    var user: User,

    @Column(nullable = false)
    var latitude: Double,

    @Column(nullable = false)
    var longitude: Double,

    @Column(nullable = false)
    var timestamp: LocalDateTime = LocalDateTime.now()
) : AuditableEntity() {

    /**
     * 위도와 경도를 새 값으로 업데이트하고, 타임스탬프를 현재 시간으로 갱신합니다.
     * 입력값이 유효한 범위(-90 ~ 90, -180 ~ 180)인지 검증합니다.
     */
    fun updateHistory(newLatitude: Double, newLongitude: Double) {
        if (newLatitude < -90 || newLatitude > 90) {
            throw IllegalArgumentException("Latitude must be between -90 and 90")
        }
        if (newLongitude < -180 || newLongitude > 180) {
            throw IllegalArgumentException("Longitude must be between -180 and 180")
        }
        this.latitude = newLatitude
        this.longitude = newLongitude
        this.timestamp = LocalDateTime.now()
    }
}