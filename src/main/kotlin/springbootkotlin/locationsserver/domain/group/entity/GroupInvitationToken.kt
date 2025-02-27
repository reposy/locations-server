package springbootkotlin.locationsserver.domain.group.entity

import jakarta.persistence.*
import springbootkotlin.locationsserver.infrastructure.config.entity.AuditableEntity
import java.time.LocalDateTime

@Entity
@Table(name = "group_invitation_token")
class GroupInvitationToken(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false, unique = true)
    val token: String,

    @Column(nullable = false)
    val groupId: Long,

    // 초대를 보낸 사용자의 ID (옵션)
    @Column(nullable = false)
    val fromUserId: Long,

    // 토큰 만료 시간
    @Column(nullable = false)
    val expiresAt: LocalDateTime,

    // 사용 횟수 제한 (예: 1회 사용, 또는 여러번 사용 가능하도록 설정)
    @Column(nullable = false)
    val maxUses: Int = 1,

    // 현재까지 사용된 횟수
    @Column(nullable = false)
    var usedCount: Int = 0
): AuditableEntity()