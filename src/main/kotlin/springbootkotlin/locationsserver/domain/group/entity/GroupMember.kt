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

    @Column(name = "joined_at", nullable = false)
    var joinedAt: LocalDateTime = LocalDateTime.now(),

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    var role: GroupMemberRole = GroupMemberRole.MEMBER

) : AuditableEntity()

enum class GroupMemberRole {
    OWNER,   // 그룹 소유자 (방장)
    MEMBER   // 일반 멤버
}