package springbootkotlin.locationsserver.domain.user.entity

import jakarta.persistence.*
import springbootkotlin.locationsserver.domain.group.entity.Group
import java.time.LocalDateTime
import springbootkotlin.locationsserver.infrastructure.config.entity.AuditableEntity

@Entity
@Table(name = "user_invitation")
class UserInvitation(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    var group: Group,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_user_id", nullable = false)
    var fromUser: User,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_user_id", nullable = false)
    var toUser: User,

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    var status: InvitationStatus = InvitationStatus.PENDING,

    @Column(name = "sent_at", nullable = false)
    var sentAt: LocalDateTime = LocalDateTime.now()
) : AuditableEntity() {

    fun accept() {
        if (status != InvitationStatus.PENDING) {
            throw IllegalStateException("초대가 이미 처리되었습니다.")
        }
        status = InvitationStatus.ACCEPTED
    }

    fun decline() {
        if (status != InvitationStatus.PENDING) {
            throw IllegalStateException("초대가 이미 처리되었습니다.")
        }
        status = InvitationStatus.DECLINED
    }
}

enum class InvitationStatus {
    PENDING, ACCEPTED, DECLINED
}