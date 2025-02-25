package springbootkotlin.locationsserver.domain.user.api

import jakarta.servlet.http.HttpSession
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import springbootkotlin.locationsserver.domain.auth.user.session.UserSessionService
import springbootkotlin.locationsserver.domain.user.entity.UserInvitation
import springbootkotlin.locationsserver.domain.user.entity.InvitationStatus
import springbootkotlin.locationsserver.domain.user.service.UserInvitationService
import springbootkotlin.locationsserver.domain.user.service.UserService
import springbootkotlin.locationsserver.domain.group.service.GroupService

@RestController
@RequestMapping("/api/user-invitations")
class UserInvitationApiController(
    private val sessionService: UserSessionService,

    private val userInvitationService: UserInvitationService,
    private val userService: UserService,
    private val groupService: GroupService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun sendInvitation(@RequestBody request: CreateUserInvitationRequest, session: HttpSession): UserInvitationResponse {
        val userInfo = sessionService.getUserInfo(session)
        if (userInfo.id != request.fromUserId)
            throw IllegalArgumentException("잘못된 요청입니다. ${request.fromUserId}, ${userInfo.id}")
        // groupId, fromUserId, toUserId를 통해 실제 엔티티 조회
        val group = groupService.getGroupById(request.groupId)
        val fromUser = userService.findById(request.fromUserId)
            ?: throw IllegalArgumentException("FromUser not found with id: ${request.fromUserId}")
        val toUser = userService.findById(request.toUserId)
            ?: throw IllegalArgumentException("ToUser not found with id: ${request.toUserId}")

        val invitation = UserInvitation(
            group = group,
            fromUser = fromUser,
            toUser = toUser,
            status = InvitationStatus.PENDING,
            sentAt = request.sentAt ?: java.time.LocalDateTime.now()
        )
        val savedInvitation = userInvitationService.sendInvitation(invitation)
        return UserInvitationResponse.fromEntity(savedInvitation)
    }

    @GetMapping("/{invitationId}")
    fun getInvitation(@PathVariable invitationId: Long): UserInvitationResponse {
        val invitation = userInvitationService.getUserInvitationById(invitationId)
            ?: throw IllegalArgumentException("Invitation not found with id: $invitationId")
        return UserInvitationResponse.fromEntity(invitation)
    }

    @PutMapping("/{invitationId}/accept")
    fun acceptInvitation(@PathVariable invitationId: Long, session: HttpSession): UserInvitationResponse {

        val invitation = userInvitationService.acceptInvitation(invitationId)
        val userInfo = sessionService.getUserInfo(session)
        if(userInfo.id != invitation.toUser.id)
            throw IllegalArgumentException("잘못된 요청입니다. ${invitation.fromUser.id}, ${userInfo.id}")

        return UserInvitationResponse.fromEntity(invitation)
    }

    @PutMapping("/{invitationId}/decline")
    fun declineInvitation(@PathVariable invitationId: Long, session: HttpSession): UserInvitationResponse {

        val invitation = userInvitationService.declineInvitation(invitationId)
        val userInfo = sessionService.getUserInfo(session)
        if(userInfo.id != invitation.toUser.id)
            throw IllegalArgumentException("잘못된 요청입니다. ${invitation.fromUser.id}, ${userInfo.id}")
        return UserInvitationResponse.fromEntity(invitation)
    }

    @GetMapping("/received")
    fun getReceivedInvitations(session: HttpSession): List<UserInvitationResponse> {
        val userInfo = sessionService.getUserInfo(session)
        val invitations = userInvitationService.getPendingInvitationsForUser(userInfo.id)
        return invitations.map { UserInvitationResponse.fromEntity(it) }
    }
}

// 요청 DTO
data class CreateUserInvitationRequest(
    val groupId: Long,
    val fromUserId: Long,
    val toUserId: Long,
    val sentAt: java.time.LocalDateTime? = null
)

// 응답 DTO
data class UserInvitationResponse(
    val id: Long?,
    val groupId: Long,
    val groupName: String,
    val fromUserId: Long,
    val fromUserNickname: String,
    val toUserId: Long,
    val status: InvitationStatus,
    val sentAt: String
) {
    companion object {
        fun fromEntity(entity: UserInvitation): UserInvitationResponse {
            return UserInvitationResponse(
                id = entity.id,
                groupId = entity.group.id!!,
                groupName = entity.group.name,
                fromUserId = entity.fromUser.id,
                fromUserNickname = entity.fromUser.nickname,
                toUserId = entity.toUser.id,
                status = entity.status,
                sentAt = entity.sentAt.toString()
            )
        }
    }
}