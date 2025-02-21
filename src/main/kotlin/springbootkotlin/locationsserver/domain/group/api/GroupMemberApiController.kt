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
        // userId를 이용하여 실제 User 엔티티를 조회
        val user = userService.findById(request.userId)
            ?: throw IllegalArgumentException("User not found with id: ${request.userId}")
        // groupId를 통해 Group 엔티티 조회
        val group = groupService.getGroupById(groupId)
        // 멤버 추가 처리
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
        // 필요시 groupId 검증 추가 가능
        val member = groupMemberService.updateSharingStatus(memberId, request.isSharingLocation)
        return GroupMemberResponse.fromEntity(member)
    }
}

// 요청 DTO
data class CreateGroupMemberRequest(
    val userId: Long,
    val isSharingLocation: Boolean
)

data class UpdateSharingStatusRequest(
    val isSharingLocation: Boolean
)

// 응답 DTO
data class GroupMemberResponse(
    val id: Long?,
    val groupId: Long,
    val userId: Long,
    val isSharingLocation: Boolean,
    val joinedAt: String
) {
    companion object {
        fun fromEntity(entity: GroupMember): GroupMemberResponse {
            return GroupMemberResponse(
                id = entity.id,
                groupId = entity.group.id!!,
                userId = entity.user.id,
                isSharingLocation = entity.isSharingLocation,
                joinedAt = entity.joinedAt.toString()
            )
        }
    }
}