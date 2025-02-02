package springbootkotlin.sharemapserver.domain.auth.user.login.api.form

import jakarta.validation.constraints.NotBlank

data class UserLoginForm (

    @field:NotBlank(message = "아이디는 Null 또는 빈 값이 아니어야 함")
    val userId: String,

    @field:NotBlank(message = "비밀번호는 Null 또는 빈 값이 아니어야 함")
    val userPassword: String
)