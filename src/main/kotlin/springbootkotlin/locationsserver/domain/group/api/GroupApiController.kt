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
        val userInfo = userSessionService.getUserInfo(session)
        val user = userService.findById(userInfo.id)
            ?: throw IllegalArgumentException("User not found with id: ${userInfo.id}")

        val group = Group(
            createUser = user,
            name = request.name,
            maxUsers = request.maxUsers
        )
        val createdGroup = groupService.createGroup(group)
        groupMemberService.addMember(createdGroup, user, isSharingLocation = true)

        return GroupResponse.fromEntity(createdGroup)
    }

    @GetMapping("/{groupId}")
    fun getGroup(@PathVariable groupId: Long, session: HttpSession): GroupResponse {
        val userInfo = userSessionService.getUserInfo(session)
        if (!groupMemberService.isMember(userInfo.id, groupId)) {
            throw IllegalArgumentException("Access denied: You are not a member of this group")
        }
        val group = groupService.getGroupById(groupId)
        return GroupResponse.fromEntity(group)
    }

    // 그룹 업데이트 엔드포인트: 수정은 소유자만 가능
    @PutMapping("/{groupId}")
    fun updateGroup(
        @PathVariable groupId: Long,
        @Valid @RequestBody request: UpdateGroupRequest,
        bindingResult: BindingResult,
        session: HttpSession
    ): GroupResponse {
        if (bindingResult.hasErrors()) {
            throw IllegalArgumentException(bindingResult.fieldError?.defaultMessage ?: "Invalid input")
        }
        val userInfo = userSessionService.getUserInfo(session)
        if (!groupMemberService.isOwner(userInfo.id, groupId)) {
            throw IllegalArgumentException("수정 권한이 없습니다.")
        }
        val updatedGroup = groupService.updateGroup(groupId, request.newName, request.newMax)
        return GroupResponse.fromEntity(updatedGroup)
    }

    // 그룹 삭제 엔드포인트: 삭제는 소유자만 가능, 제한적 삭제 적용
    @DeleteMapping("/{groupId}")
    fun deleteGroup(@PathVariable groupId: Long, session: HttpSession): GroupResponse {
        val userInfo = userSessionService.getUserInfo(session)
        if (!groupMemberService.isOwner(userInfo.id, groupId)) {
            throw IllegalArgumentException("삭제 권한이 없습니다.")
        }
        val deletedGroup = groupService.deleteGroup(groupId)
        return GroupResponse.fromEntity(deletedGroup)
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

data class UpdateGroupRequest(
    @field:NotBlank(message = "그룹 이름은 필수입니다.")
    @field:Size(min = 2, max = 20, message = "그룹 이름은 최소 2글자, 최대 20글자여야 합니다.")
    val newName: String,
    @field:Min(value = 2, message = "최대 사용자 수는 최소 2명이어야 합니다.")
    @field:Max(value = 10, message = "최대 사용자 수는 10명까지 가능합니다.")
    val newMax: Int
)

data class GroupResponse(
    val id: Long?,
    val createUserId: Long,
    val createUserNickname: String?,
    val memberCount: Long?,
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
                createUserNickname = group.createUser.nickname,
                memberCount = group.members.size.toLong(),
                name = group.name,
                maxUsers = group.maxUsers,
                createdAt = group.createdAt.toString(),
                lastModifiedAt = group.lastModifiedAt.toString()
            )
        }
    }
}