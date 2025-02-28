package springbootkotlin.locationsserver.domain.group.api

import jakarta.servlet.http.HttpSession
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import springbootkotlin.locationsserver.domain.auth.user.session.UserSessionService
import springbootkotlin.locationsserver.domain.group.entity.GroupMember
import springbootkotlin.locationsserver.domain.group.service.GroupMemberService
import springbootkotlin.locationsserver.domain.group.service.GroupService
import springbootkotlin.locationsserver.domain.user.service.UserService

@RestController
@RequestMapping("/api/groups/{groupId}/members")
class GroupMemberApiController(
    private val groupMemberService: GroupMemberService,
    private val userService: UserService,
    private val groupService: GroupService,
    private val sessionService: UserSessionService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun addMember(
        @PathVariable groupId: Long,
        @RequestBody request: CreateGroupMemberRequest
    ): GroupMemberResponse {
        val user = userService.findById(request.userId)
            ?: throw IllegalArgumentException("User not found with id: ${request.userId}")
        val group = groupService.getGroupById(groupId)
        val member = groupMemberService.addMember(
            group = group,
            user = user,
        )
        return GroupMemberResponse.fromEntity(member)
    }

    @GetMapping
    fun getMembers(@PathVariable groupId: Long): List<GroupMemberResponse> {
        return groupMemberService.getMembersByGroupId(groupId)
            .map { GroupMemberResponse.fromEntity(it) }
    }

    @DeleteMapping("/{memberId}")
    fun removeMember(
        @PathVariable groupId: Long,
        @PathVariable memberId: Long,
        session: HttpSession
    ): ResponseEntity<List<GroupMemberResponse>> {
        val requester = sessionService.getUserInfo(session)
        groupMemberService.removeMember(requester.id, groupId, memberId)

        // 최신 멤버 목록 반환
        val updatedMembers = groupMemberService.getMembersByGroupId(groupId)
            .map { GroupMemberResponse.fromEntity(it) }
        return ResponseEntity.ok(updatedMembers)
    }
}

data class CreateGroupMemberRequest(
    val userId: Long,
    val isSharingLocation: Boolean
)

data class GroupMemberResponse(
    val id: Long?,
    val groupId: Long,
    val userId: Long,
    val nickname: String, // 추가: 사용자 닉네임
    val role: String,
    val joinedAt: String
) {
    companion object {
        fun fromEntity(entity: GroupMember): GroupMemberResponse {
            return GroupMemberResponse(
                id = entity.id,
                groupId = entity.group.id,
                userId = entity.user.id,
                nickname = entity.user.nickname,  // User 엔티티의 닉네임을 사용
                role = entity.role.name,
                joinedAt = entity.joinedAt.toString()
            )
        }
    }
}