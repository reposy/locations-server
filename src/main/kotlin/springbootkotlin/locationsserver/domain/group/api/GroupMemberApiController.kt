package springbootkotlin.locationsserver.domain.group.api

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import springbootkotlin.locationsserver.domain.group.entity.GroupMember
import springbootkotlin.locationsserver.domain.group.service.GroupMemberService
import springbootkotlin.locationsserver.domain.group.service.GroupService
import springbootkotlin.locationsserver.domain.user.service.UserService

@RestController
@RequestMapping("/api/groups/{groupId}/members")
class GroupMemberApiController(
    private val groupMemberService: GroupMemberService,
    private val userService: UserService,
    private val groupService: GroupService
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
            isSharingLocation = request.isSharingLocation
        )
        return GroupMemberResponse.fromEntity(member)
    }

    @GetMapping
    fun getMembers(@PathVariable groupId: Long): List<GroupMemberResponse> {
        return groupMemberService.getMembersByGroupId(groupId)
            .map { GroupMemberResponse.fromEntity(it) }
    }

    @PutMapping("/{memberId}/sharing")
    fun updateSharingStatus(
        @PathVariable groupId: Long,
        @PathVariable memberId: Long,
        @RequestBody request: UpdateSharingStatusRequest
    ): GroupMemberResponse {
        val member = groupMemberService.updateSharingStatus(memberId, request.isSharingLocation)
        return GroupMemberResponse.fromEntity(member)
    }
}

data class CreateGroupMemberRequest(
    val userId: Long,
    val isSharingLocation: Boolean
)

data class UpdateSharingStatusRequest(
    val isSharingLocation: Boolean
)

data class GroupMemberResponse(
    val id: Long?,
    val groupId: Long,
    val userId: Long,
    val nickname: String, // 추가: 사용자 닉네임
    val isSharingLocation: Boolean,
    val joinedAt: String
) {
    companion object {
        fun fromEntity(entity: GroupMember): GroupMemberResponse {
            return GroupMemberResponse(
                id = entity.id,
                groupId = entity.group.id!!,
                userId = entity.user.id,
                nickname = entity.user.nickname,  // User 엔티티의 닉네임을 사용
                isSharingLocation = entity.isSharingLocation,
                joinedAt = entity.joinedAt.toString()
            )
        }
    }
}