package springbootkotlin.locationsserver.domain.group.entity

import jakarta.persistence.*
import springbootkotlin.locationsserver.infrastructure.config.entity.AuditableEntity
import springbootkotlin.locationsserver.domain.user.entity.User

@Entity
@Table(name = "group_chat_message")
class GroupChatMessage(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    var group: Group,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    var sender: User,

    @Column(nullable = false)
    var message: String
) : AuditableEntity() {

    /**
     * 메시지를 업데이트합니다.
     * 새로운 메시지는 빈 문자열일 수 없습니다.
     */
    fun updateMessage(newMessage: String) {
        if (newMessage.isBlank()) {
            throw IllegalArgumentException("Message cannot be blank")
        }
        message = newMessage
    }
}