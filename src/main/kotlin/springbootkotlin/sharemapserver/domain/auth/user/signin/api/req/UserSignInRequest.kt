package springbootkotlin.sharemapserver.domain.auth.user.signin.api.req

import jakarta.validation.constraints.NotBlank

data class UserSignInRequest (

    @field:NotBlank(message = "아이디는 Null 또는 빈 값이 아니어야 함")
    val username: String,

    @field:NotBlank(message = "비밀번호는 Null 또는 빈 값이 아니어야 함")
    val password: String
)