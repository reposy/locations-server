package springbootkotlin.locationsserver.domain.group.entity

import jakarta.persistence.*
import java.time.LocalDateTime
import springbootkotlin.locationsserver.infrastructure.config.entity.AuditableEntity
import springbootkotlin.locationsserver.domain.user.entity.User

@Entity
@Table(name = "group_member")
class GroupMember(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    var group: Group,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    var user: User,

    @Column(name = "is_sharing_location", nullable = false)
    var isSharingLocation: Boolean = false,

    @Column(name = "joined_at", nullable = false)
    var joinedAt: LocalDateTime = LocalDateTime.now()
) : AuditableEntity() {

    /**
     * 그룹 멤버의 위치 공유 상태를 업데이트합니다.
     */
    fun updateSharingStatus(newStatus: Boolean) {
        this.isSharingLocation = newStatus
    }
}