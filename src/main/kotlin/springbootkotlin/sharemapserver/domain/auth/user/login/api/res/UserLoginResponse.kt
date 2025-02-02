package springbootkotlin.sharemapserver.domain.auth.user.login.api.res

data class UserLoginResponse(
    val id: Long,
    val username: String,
    val emailAddress: String,
    val sessionExpiresAt: String // 세션 만료 시간 (ISO 8601 형식)
)