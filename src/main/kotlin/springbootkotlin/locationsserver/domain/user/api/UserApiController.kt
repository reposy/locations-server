package springbootkotlin.locationsserver.domain.user.api

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import springbootkotlin.locationsserver.domain.user.entity.User
import springbootkotlin.locationsserver.domain.user.service.UserService

@RestController
@RequestMapping("/api/users")
class UserApiController(
    private val userService: UserService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createUser(@RequestBody request: CreateUserRequest): UserResponse {
        val user = User(
            username = request.username,
            password = request.password,
            nickname = request.nickname,
            emailAddress = request.emailAddress
        )
        val savedUser = userService.save(user)
        return UserResponse.fromEntity(savedUser)
    }

    @GetMapping("/{userId}")
    fun getUser(@PathVariable userId: Long): UserResponse {
        val user = userService.findById(userId)
            ?: throw IllegalArgumentException("User not found with id: $userId")
        return UserResponse.fromEntity(user)
    }

    // 예시: 마지막 로그인 시간 업데이트 (로그인 성공 후 호출)
    @PutMapping("/{userId}/last-logined-at")
    fun updateLastLoginedAt(@PathVariable userId: Long): UserResponse {
        val user = userService.findById(userId)
            ?: throw IllegalArgumentException("User not found with id: $userId")
        val updatedUser = userService.updateLastLoginedAt(user)
        return UserResponse.fromEntity(updatedUser)
    }
}

// 요청 DTO
data class CreateUserRequest(
    val username: String,
    val password: String,
    val nickname: String,
    val emailAddress: String
)

// 응답 DTO
data class UserResponse(
    val id: Long,
    val username: String,
    val nickname: String,
    val emailAddress: String,
    val joinedAt: String,
    val lastLoginedAt: String?
) {
    companion object {
        fun fromEntity(entity: User): UserResponse {
            return UserResponse(
                id = entity.id,
                username = entity.username,
                nickname = entity.nickname,
                emailAddress = entity.emailAddress,
                joinedAt = entity.joinedAt.toString(),
                lastLoginedAt = entity.lastLoginedAt?.toString()
            )
        }
    }
}