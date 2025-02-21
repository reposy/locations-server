package springbootkotlin.locationsserver.domain.user.entity

import jakarta.persistence.*
import java.time.LocalDateTime
import springbootkotlin.locationsserver.infrastructure.config.entity.AuditableEntity
import springbootkotlin.locationsserver.domain.group.entity.Group

@Entity
@Table(name = "user_location")
class UserLocation(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    var user: User,

    // 특정 그룹과 연관된 위치인 경우, 그룹 정보를 저장 (필요하지 않다면 nullable)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    var group: Group? = null,

    @Column(nullable = false)
    var latitude: Double,

    @Column(nullable = false)
    var longitude: Double,

    @Column(nullable = false)
    var timestamp: LocalDateTime = LocalDateTime.now()
) : AuditableEntity() {

    /**
     * 새로운 위도와 경도를 받아 현재 위치를 업데이트합니다.
     * 위도는 -90 ~ 90, 경도는 -180 ~ 180 사이여야 합니다.
     */
    fun updateLocation(newLatitude: Double, newLongitude: Double) {
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