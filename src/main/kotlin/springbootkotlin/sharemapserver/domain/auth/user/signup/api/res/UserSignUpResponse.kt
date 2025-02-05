package springbootkotlin.sharemapserver.domain.auth.user.signup.api.res

import springbootkotlin.sharemapserver.domain.user.entity.User
import java.time.format.DateTimeFormatter

data class UserSignUpResponse(
    val id: Long,
    val username: String,
    val emailAddress: String,
    val nickname: String,
    val createdAt: String // ISO 8601 형식
) {
    companion object {
        fun fromEntity(user: User): UserSignUpResponse {
            return UserSignUpResponse(
                id = user.id,
                username = user.username,
                emailAddress = user.emailAddress,
                nickname = user.nickname,
                createdAt = user.createdAt.format(DateTimeFormatter.ISO_DATE_TIME)
            )
        }
    }
}