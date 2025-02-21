package springbootkotlin.locationsserver.domain.group.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import springbootkotlin.locationsserver.domain.group.entity.GroupChatMessage
import springbootkotlin.locationsserver.domain.group.repository.GroupChatMessageRepository

@Service
@Transactional
class GroupChatMessageService(
    private val groupChatMessageRepository: GroupChatMessageRepository
) {

    /**
     * 새로운 채팅 메시지를 전송합니다.
     */
    fun sendMessage(chatMessage: GroupChatMessage): GroupChatMessage {
        if (chatMessage.message.isBlank()) {
            throw IllegalArgumentException("Message cannot be blank")
        }
        return groupChatMessageRepository.save(chatMessage)
    }

    /**
     * 기존 채팅 메시지를 업데이트합니다.
     */
    fun updateMessage(messageId: Long, newMessage: String): GroupChatMessage {
        val chatMessage = groupChatMessageRepository.findById(messageId)
            .orElseThrow { IllegalArgumentException("Chat message not found") }
        chatMessage.updateMessage(newMessage)
        return groupChatMessageRepository.save(chatMessage)
    }

    /**
     * 특정 그룹에 속한 모든 채팅 메시지를 조회합니다.
     */
    fun getMessagesByGroup(groupId: Long): List<GroupChatMessage> {
        return groupChatMessageRepository.findByGroupId(groupId)
    }
}