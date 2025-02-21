package springbootkotlin.locationsserver.domain.group.api

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import springbootkotlin.locationsserver.domain.group.entity.GroupChatMessage
import springbootkotlin.locationsserver.domain.group.service.GroupChatMessageService
import springbootkotlin.locationsserver.domain.group.service.GroupService
import springbootkotlin.locationsserver.domain.user.service.UserService

@RestController
@RequestMapping("/api/groups/{groupId}/chat-messages")
class GroupChatMessageApiController(
    private val groupChatMessageService: GroupChatMessageService,
    private val userService: UserService,
    private val groupService: GroupService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createChatMessage(
        @PathVariable groupId: Long,
        @RequestBody request: CreateChatMessageRequest
    ): GroupChatMessageResponse {
        val sender = userService.findById(request.senderId)
            ?: throw IllegalArgumentException("Sender not found with id: ${request.senderId}")
        val group = groupService.getGroupById(groupId)
        val chatMessage = GroupChatMessage(
            group = group,
            sender = sender,
            message = request.message
        )
        val savedMessage = groupChatMessageService.sendMessage(chatMessage)
        return GroupChatMessageResponse.fromEntity(savedMessage)
    }

    @PutMapping("/{messageId}")
    fun updateChatMessage(
        @PathVariable groupId: Long,
        @PathVariable messageId: Long,
        @RequestBody request: UpdateChatMessageRequest
    ): GroupChatMessageResponse {
        val updatedMessage = groupChatMessageService.updateMessage(messageId, request.newMessage)
        return GroupChatMessageResponse.fromEntity(updatedMessage)
    }

    @GetMapping
    fun getChatMessages(
        @PathVariable groupId: Long
    ): List<GroupChatMessageResponse> {
        val messages = groupChatMessageService.getMessagesByGroup(groupId)
        return messages.map { GroupChatMessageResponse.fromEntity(it) }
    }
}

// 요청 DTO (domain.api.req)
data class CreateChatMessageRequest(
    val senderId: Long,
    val message: String
)

data class UpdateChatMessageRequest(
    val newMessage: String
)

// 응답 DTO (domain.api.res)
data class GroupChatMessageResponse(
    val id: Long?,
    val groupId: Long,
    val senderId: Long,
    val message: String,
    val createdAt: String?
) {
    companion object {
        fun fromEntity(entity: GroupChatMessage): GroupChatMessageResponse {
            return GroupChatMessageResponse(
                id = entity.id,
                groupId = entity.group.id!!,
                senderId = entity.sender.id,
                message = entity.message,
                createdAt = entity.createdAt.toString()
            )
        }
    }
}