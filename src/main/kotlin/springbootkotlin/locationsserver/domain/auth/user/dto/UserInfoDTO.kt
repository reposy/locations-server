package springbootkotlin.locationsserver.domain.auth.user.dto

import springbootkotlin.locationsserver.domain.user.entity.User


data class UserInfoDTO (
    val id: Long,
    val nickname: String,
    val username: String,
    val emailAddress: String,
) {
    companion object {
        fun fromEntity(user: User): UserInfoDTO {
            return UserInfoDTO(
                id = user.id,
                nickname = user.nickname,
                username = user.username,
                emailAddress =  user.emailAddress
            )
        }
    }
}