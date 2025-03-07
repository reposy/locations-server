package springbootkotlin.locationsserver.domain.guest.api

import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import springbootkotlin.locationsserver.domain.group.entity.GroupInvitationToken
import springbootkotlin.locationsserver.domain.group.entity.GroupMember
import springbootkotlin.locationsserver.domain.group.service.GroupInvitationTokenService
import springbootkotlin.locationsserver.domain.group.service.GroupMemberService
import springbootkotlin.locationsserver.domain.group.service.GroupService
import springbootkotlin.locationsserver.domain.guest.entity.Guest
import springbootkotlin.locationsserver.domain.guest.service.GuestService
import springbootkotlin.locationsserver.infrastructure.config.properties.NaverMapProperties
import springbootkotlin.locationsserver.infrastructure.external.naver.map.api.res.NaverMapApiResponse
import java.time.format.DateTimeFormatter

@RestController
@RequestMapping("/api/guest/")
class GuestApiController(
    private val tokenService: GroupInvitationTokenService,
    private val groupService: GroupService,
    private val groupMemberService: GroupMemberService,
    private val guestUserService: GuestService,
    private val naverMapProperties: NaverMapProperties,
    ) {

    @GetMapping("/naver/map/client-id")
    fun getClientId(): ResponseEntity<NaverMapApiResponse> {
        return ResponseEntity.ok(
            NaverMapApiResponse(naverMapProperties.clientId)
        )
    }

    /**
     * /group-invitations/join 엔드포인트는 단순히 토큰 유효성을 검사한 후,
     * 유효하면 토큰을 쿼리 파라미터로 포함하여 /guest 페이지로 리다이렉트합니다.
     */
    @GetMapping("/group-invitations/join")
    fun joinGroup(
        @RequestParam token: String
    ): ResponseEntity<Any> {
        val tokenEntity: GroupInvitationToken? = tokenService.findValidToken(token)
        if (tokenEntity == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                mapOf("message" to "초대 링크가 유효하지 않거나 만료되었습니다. 링크는 1시간 유지되며, 한 번만 사용 가능합니다.")
            )
        }
        val headers = HttpHeaders()
        headers.add("Location", "/guest?token=$token")
        return ResponseEntity(headers, HttpStatus.FOUND)
    }

    /**
     * /consume 엔드포인트는 guest-index.html에서 호출되어 토큰을 실제 소비(consumed)합니다.
     * 소비에 성공하면 게스트 사용자를 그룹 멤버로 등록하고, 그룹 ID 및 만료 시간을 반환합니다.
     */
    @GetMapping("/group-invitations/consume")
    fun consumeToken(
        @RequestParam token: String
    ): ResponseEntity<GroupInvitationJoinResponse> {
        val tokenEntity: GroupInvitationToken? = tokenService.validateAndConsumeToken(token)
        if (tokenEntity == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                GroupInvitationJoinResponse(
                    guestNickname = null,
                    groupId = null,
                    guestId = null,
                    expiresAt = null,
                    message = "초대 링크가 이미 사용되었거나 유효하지 않습니다."
                )
            )
        }

        // 게스트 사용자 생성 후 그룹 멤버로 등록 (게스트는 자동으로 등록)
        val guest = guestUserService.createGuest()
        // 그룹 정보 조회 (groupService.getGroupById는 null이 아닌 그룹을 반환한다고 가정)
        val group = groupService.getGroupById(tokenEntity.groupId)
        // 그룹 멤버 등록 (isSharingLocation은 기본값 false로 설정)
        groupMemberService.addMember(group, guest)

        val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
        return ResponseEntity.ok(
            GroupInvitationJoinResponse(
                groupId = tokenEntity.groupId,
                guestId = guest.id,
                guestNickname = guest.nickname,
                expiresAt = tokenEntity.expiresAt.format(formatter),
                message = "게스트로 그룹 입장이 완료되었습니다."
            )
        )
    }

    /**
     * /groups/{groupId} 엔드포인트: 게스트가 그룹 정보를 조회합니다.
     */
    @GetMapping("/groups/{groupId}")
    fun getGroupInfo(
        @PathVariable groupId: Long
    ): ResponseEntity<GroupInfoResponse> {
        val group = groupService.getGroupById(groupId)
        return ResponseEntity.ok(GroupInfoResponse.fromEntity(group))
    }

    /**
     * /groups/{groupId}/members 엔드포인트: 게스트가 그룹 멤버 목록을 조회합니다.
     */
    @GetMapping("/groups/{groupId}/members")
    fun getGroupMembers(
        @PathVariable groupId: Long
    ): ResponseEntity<List<GroupMemberResponse>> {
        val members = groupMemberService.getMembersByGroupId(groupId)
        val response = members.map { GroupMemberResponse.fromEntity(it) }
        return ResponseEntity.ok(response)
    }
}

data class GroupInvitationJoinResponse(
    val guestNickname: String?,
    val groupId: Long?,
    val guestId: Long?,
    val expiresAt: String?,
    val message: String
)

data class GroupInfoResponse(
    val groupId: Long?,
    val name: String?,
) {
    companion object {
        fun fromEntity(group: springbootkotlin.locationsserver.domain.group.entity.Group): GroupInfoResponse {
            return GroupInfoResponse(
                groupId = group.id,
                name = group.name,
            )
        }
    }
}

data class GroupMemberResponse(
    val id: Long,
    val groupId: Long,
    val userId: Long,
    val nickname: String,
    val role: String,  // "OWNER" 또는 "MEMBER" 등
    val joinedAt: String
) {
    companion object {
        fun fromEntity(member: GroupMember): GroupMemberResponse {
            return GroupMemberResponse(
                id = member.id,
                groupId = member.group.id,
                userId = member.user.id,
                nickname = member.user.nickname,
                role = member.role.name, // Enum 값의 이름 (예: "OWNER", "MEMBER")
                joinedAt = member.joinedAt.toString()
            )
        }
    }
}