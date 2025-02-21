package springbootkotlin.locationsserver.domain.group.entity

import jakarta.persistence.*
import springbootkotlin.locationsserver.infrastructure.config.entity.AuditableEntity

@Entity
@Table(name = "group_event_log")
class GroupEventLog(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    var group: Group,

    @Column(name = "event_type", nullable = false)
    val eventType: String,  // 생성 후 변경되지 않으므로 val로 선언

    @Column(nullable = false)
    var description: String
) : AuditableEntity() {

    init {
        require(eventType.isNotBlank()) { "Event type cannot be blank" }
        require(description.isNotBlank()) { "Description cannot be blank" }
    }

    /**
     * 이벤트 로그의 설명을 업데이트합니다.
     * 새로운 설명은 빈 문자열일 수 없습니다.
     */
    fun updateDescription(newDescription: String) {
        require(newDescription.isNotBlank()) { "Description cannot be blank" }
        this.description = newDescription
    }
}