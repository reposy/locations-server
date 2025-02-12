package springbootkotlin.locationsserver.domain.location.entity

import jakarta.persistence.*
import springbootkotlin.locationsserver.infrastructure.config.entity.AuditableEntity

@Entity
@Table(name = "location")
class Location(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0, // PK

    @Column(nullable = false)
    val createUserId: Long, // FK (사용자 ID)

    @Column(nullable = false, length = 255)
    val nickname: String, // 장소 이름

    @Column(nullable = true, length = 500)
    val address: String?, // 주소 (옵션)

    @Column(nullable = true, length = 500)
    val detailAddress: String?, // 상세 주소 (옵션)

    @Column(nullable = true, length = 255)
    val roadName: String?, // 도로명 주소 (옵션)

    @Column(nullable = false)
    val latitude: Double, // 위도

    @Column(nullable = false)
    val longitude: Double, // 경도

    @Column(nullable = true, length = 20)
    val markerColor: String = DEFAULT_MARKER_COLOR, // ✅ 마커 색상 필드 추가 (기본값: 파랑)

    @Column(nullable = true, length = 20)
    val markerType: String = DEFAULT_MARKER_TYPE // ✅ 마커 타입 필드 추가 (기본값: 기본 마커)

) : AuditableEntity() {

    companion object {
        const val DEFAULT_MARKER_COLOR = "#0000FF" // 기본 마커 색상 (파랑)
        const val DEFAULT_MARKER_TYPE = "default" // 기본 마커 타입 (네이버 기본 핀)
    }
}