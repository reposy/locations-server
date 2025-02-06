package springbootkotlin.sharemapserver.domain.auth.user.dto

import springbootkotlin.sharemapserver.domain.user.entity.User


data class UserInfoDTO (
    val nickname: String,
    val username: String,
    val emailAddress: String,
) {
    companion object {
        fun fromEntity(user: User): UserInfoDTO {
            return UserInfoDTO(
                nickname = user.nickname,
                username = user.username,
                emailAddress =  user.emailAddress
            )
        }
    }
}