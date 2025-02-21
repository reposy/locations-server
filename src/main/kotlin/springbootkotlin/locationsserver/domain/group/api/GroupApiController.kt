package springbootkotlin.locationsserver.domain.group.api

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import springbootkotlin.locationsserver.domain.group.entity.Group
import springbootkotlin.locationsserver.domain.group.service.GroupService
import springbootkotlin.locationsserver.domain.user.service.UserService

@RestController
@RequestMapping("/api/groups")
class GroupApiController(
    private val groupService: GroupService,
    private val userService: UserService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createGroup(@RequestBody request: CreateGroupRequest): GroupResponse {
        // User ID로 실제 User 엔티티를 조회
        val user = userService.findById(request.createUserId)
            ?: throw IllegalArgumentException("User not found with id: ${request.createUserId}")
        // Group 엔티티 생성
        val group = Group(
            createUser = user,
            name = request.name,
            maxUsers = request.maxUsers
        )
        return GroupResponse.fromEntity(groupService.createGroup(group))
    }

    @GetMapping("/{groupId}")
    fun getGroup(@PathVariable groupId: Long): GroupResponse {
        return GroupResponse.fromEntity(groupService.getGroupById(groupId))
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
    val createUserId: Long,
    val name: String,
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