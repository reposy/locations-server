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

        // 이미 초대된 사용자인지 확인 (예: status가 PENDING인 초대가 존재하는지)
        if (userInvitationService.existsPendingInvitation(fromUser, toUser, group))
            throw IllegalArgumentException("이미 초대된 사용자입니다.")

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
    fun acceptInvitation(
        @PathVariable invitationId: Long,
        session: HttpSession
    ): UserInvitationResponse {
        val userInfo = sessionService.getUserInfo(session)
        val invitation = userInvitationService.getUserInvitationById(invitationId)
            ?: throw IllegalArgumentException("Invitation not found with id: $invitationId")
        if (userInfo.id != invitation.toUser.id)
            throw IllegalArgumentException("잘못된 요청입니다. 세션 사용자와 초대받은 사용자가 다릅니다.")

        val updatedInvitation = userInvitationService.acceptInvitation(invitationId)
        return UserInvitationResponse.fromEntity(updatedInvitation)
    }

    @PutMapping("/{invitationId}/decline")
    fun declineInvitation(
        @PathVariable invitationId: Long,
        session: HttpSession
    ): UserInvitationResponse {
        val userInfo = sessionService.getUserInfo(session)
        val invitation = userInvitationService.getUserInvitationById(invitationId)
            ?: throw IllegalArgumentException("Invitation not found with id: $invitationId")
        if (userInfo.id != invitation.toUser.id)
            throw IllegalArgumentException("잘못된 요청입니다. 세션 사용자와 초대받은 사용자가 다릅니다.")

        val updatedInvitation = userInvitationService.declineInvitation(invitationId)
        return UserInvitationResponse.fromEntity(updatedInvitation)
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
    val sentAt: String,
) {
    companion object {
        fun fromEntity(entity: UserInvitation): UserInvitationResponse {
            return UserInvitationResponse(
                id = entity.id,
                groupId = entity.group.id,
                groupName = entity.group.name,
                fromUserId = entity.fromUser.id,
                fromUserNickname = entity.fromUser.nickname,
                toUserId = entity.toUser.id,
                status = entity.status,
                sentAt = entity.sentAt.toString(),
            )
        }
    }
}