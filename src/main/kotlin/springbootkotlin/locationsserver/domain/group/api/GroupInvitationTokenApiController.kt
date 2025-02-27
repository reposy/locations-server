package springbootkotlin.locationsserver.domain.group.api

import jakarta.servlet.http.HttpServletResponse
import jakarta.servlet.http.HttpSession
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import springbootkotlin.locationsserver.domain.auth.user.session.UserSessionService
import springbootkotlin.locationsserver.domain.group.entity.GroupInvitationToken
import springbootkotlin.locationsserver.domain.group.service.GroupInvitationTokenService
import java.time.format.DateTimeFormatter

@RestController
@RequestMapping("/api/groups/{groupId}/invitation-tokens")
class GroupInvitationApiTokenController(
    private val tokenService: GroupInvitationTokenService,
    private val sessionService: UserSessionService
) {

    // 초대 링크 생성 API
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createInvitation(
        @PathVariable groupId: Long,
        session: HttpSession
    ): GroupInvitationResponse {
        val fromUser = sessionService.getUserInfo(session)
        val token = tokenService.createToken(groupId, fromUser.id)
        return GroupInvitationResponse.fromEntity(token)
    }
}

data class GroupInvitationResponse(
    val invitationLink: String,
    val expiresAt: String,
) {
    companion object {
        fun fromEntity(token: GroupInvitationToken): GroupInvitationResponse {
            val baseUrl = "http://localhost:8080/api/guest/group-invitations/join"
            val link = "$baseUrl?token=${token.token}"
            val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
            val expiration = token.expiresAt.format(formatter)
            return GroupInvitationResponse(
                invitationLink = link,
                expiresAt = expiration
            )
        }
    }
}

data class GroupInvitationValidationResponse(
    val groupId: Long? = null,
    val expiresAt: String? = null,
    val message: String? = null
) {
    companion object {
        fun fromEntity(token: GroupInvitationToken): GroupInvitationValidationResponse {
            val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
            return GroupInvitationValidationResponse(
                groupId = token.groupId,
                expiresAt = token.expiresAt.format(formatter)
            )
        }
    }
}