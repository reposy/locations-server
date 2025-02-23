package springbootkotlin.locationsserver.domain.user.api

import jakarta.servlet.http.HttpSession
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import springbootkotlin.locationsserver.domain.user.entity.User
import springbootkotlin.locationsserver.domain.user.service.UserService
import springbootkotlin.locationsserver.domain.auth.user.dto.UserInfoDTO

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

    // 마지막 로그인 시간 업데이트 (예시)
    @PutMapping("/{userId}/last-logined-at")
    fun updateLastLoginedAt(@PathVariable userId: Long): UserResponse {
        val user = userService.findById(userId)
            ?: throw IllegalArgumentException("User not found with id: $userId")
        val updatedUser = userService.updateLastLoginedAt(user)
        return UserResponse.fromEntity(updatedUser)
    }

    // 현재 로그인한 사용자 정보 반환
    @GetMapping("/me")
    fun getCurrentUser(session: HttpSession): UserResponse {
        // 세션에 저장된 UserInfoDTO 객체를 통해 현재 사용자 ID를 가져온다고 가정합니다.
        val userInfo = session.getAttribute("USER") as? UserInfoDTO
            ?: throw IllegalArgumentException("세션이 만료되었거나, 로그인하지 않았습니다.")
        val user = userService.findById(userInfo.id)
            ?: throw IllegalArgumentException("User not found with id: ${userInfo.id}")
        return UserResponse.fromEntity(user)
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