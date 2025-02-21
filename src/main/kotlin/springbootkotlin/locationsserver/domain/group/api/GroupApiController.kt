package springbootkotlin.locationsserver.domain.group.api

import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.http.HttpStatus
import org.springframework.validation.BindingResult
import org.springframework.web.bind.annotation.*
import springbootkotlin.locationsserver.domain.group.entity.Group
import springbootkotlin.locationsserver.domain.group.service.GroupService
import springbootkotlin.locationsserver.domain.group.service.GroupMemberService
import springbootkotlin.locationsserver.domain.auth.user.session.UserSessionService
import springbootkotlin.locationsserver.domain.user.service.UserService

@RestController
@RequestMapping("/api/groups")
class GroupApiController(
    private val groupService: GroupService,
    private val userService: UserService,
    private val groupMemberService: GroupMemberService,
    private val userSessionService: UserSessionService
) {

    @GetMapping("/my")
    fun getMyGroups(session: HttpSession): List<GroupResponse> {
        val userInfo = userSessionService.getUserInfo(session)
        val groups: List<Group> = groupMemberService.getGroupsByUserId(userInfo.id)
        return groups.map { GroupResponse.fromEntity(it) }
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createGroup(
        @Valid @RequestBody request: CreateGroupRequest,
        bindingResult: BindingResult,
        session: HttpSession
    ): GroupResponse {
        if (bindingResult.hasErrors()) {
            throw IllegalArgumentException(bindingResult.fieldError?.defaultMessage ?: "Invalid input")
        }
        // 세션에서 현재 사용자 정보 가져오기
        val userInfo = userSessionService.getUserInfo(session)
        val user = userService.findById(userInfo.id)
            ?: throw IllegalArgumentException("User not found with id: ${userInfo.id}")

        // Group 엔티티 생성
        val group = Group(
            createUser = user,
            name = request.name,
            maxUsers = request.maxUsers
        )
        // 그룹 생성
        val createdGroup = groupService.createGroup(group)

        // 그룹 생성 후, 생성자를 그룹 멤버로 추가 (예: 위치 공유 기본값 true로 설정)
        groupMemberService.addMember(createdGroup, user, isSharingLocation = true)

        return GroupResponse.fromEntity(createdGroup)
    }

    @GetMapping("/{groupId}")
    fun getGroup(@PathVariable groupId: Long): GroupResponse {
        val group = groupService.getGroupById(groupId)
            ?: throw IllegalArgumentException("Group not found with id: $groupId")
        return GroupResponse.fromEntity(group)
    }

    @PutMapping("/{groupId}/name")
    fun updateGroupName(
        @PathVariable groupId: Long,
        @RequestBody request: UpdateGroupNameRequest
    ): GroupResponse {
        return GroupResponse.fromEntity(groupService.updateGroupName(groupId, request.newName))
    }

    @PutMapping("/{groupId}/max-users")
    fun updateGroupMaxUsers(
        @PathVariable groupId: Long,
        @RequestBody request: UpdateGroupMaxUsersRequest
    ): GroupResponse {
        return GroupResponse.fromEntity(groupService.updateGroupMaxUsers(groupId, request.newMax))
    }

}

data class CreateGroupRequest(
    @field:NotBlank(message = "그룹 이름은 필수입니다.")
    @field:Size(min = 2, max = 20, message = "그룹 이름은 최소 2글자, 최대 20글자여야 합니다.")
    val name: String,
    @field:Min(value = 2, message = "최대 사용자 수는 최소 2명이어야 합니다.")
    @field:Max(value = 10, message = "최대 사용자 수는 10명까지 가능합니다.")
    val maxUsers: Int
)

data class UpdateGroupNameRequest(
    val newName: String
)

data class UpdateGroupMaxUsersRequest(
    val newMax: Int
)

data class GroupResponse(
    val id: Long?,
    val createUserId: Long,
    val name: String,
    val maxUsers: Int,
    val createdAt: String?,
    val lastModifiedAt: String?
) {
    companion object {
        fun fromEntity(group: Group): GroupResponse {
            return GroupResponse(
                id = group.id,
                createUserId = group.createUser.id,
                name = group.name,
                maxUsers = group.maxUsers,
                createdAt = group.createdAt.toString(),
                lastModifiedAt = group.lastModifiedAt.toString()
            )
        }
    }
}