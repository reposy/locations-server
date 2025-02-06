package springbootkotlin.sharemapserver.domain.auth.user.signup.api.req

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

data class UserSignUpRequest(

    @field:NotBlank(message = "아이디를 입력해주세요.")
    @field:Size(min = 4, max = 20, message = "아이디는 4~20자여야 합니다.")
    @field:Pattern(
        regexp = "^(?=.*[a-zA-Z])[A-Za-z\\d]+$",
        message = "아이디는 영문자, 숫자로 구성하며, 1개 이상의 영문자를 포함해야 합니다."
    )
    val username: String,

    @field:NotBlank(message = "별명을 입력해주세요.")
    @field:Size(min = 3, max = 10, message = "별명은 3~10자여야 가능합니다.")
    @field:Pattern(
        regexp = "^[가-힣A-Za-z\\d]+$",
        message = "별명은 한글(자음, 모음 단독 제외), 영문, 숫자만 가능합니다."
    )
    val nickname: String,

    @field:NotBlank(message = "비밀번호를 입력해주세요.")
    @field:Size(min = 8, max = 20, message = "비밀번호는 8~20자여야 합니다.")
    @field:Pattern(
        regexp = "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[!@#\$%^&*])[A-Za-z\\d!@#\$%^&*]+$",
        message = "비밀번호는 영문자, 숫자, 특수문자(!@#$%^&*)를 포함해야 합니다."
    )
    val password: String,

    @field:NotBlank(message = "이메일을 입력해주세요.")
    @field:Size(min = 3, max = 244, message = "이메일은 3~244자여야 합니다.")
    @field:Email(message = "올바른 이메일 형식이 아닙니다.")
    val emailAddress: String
)