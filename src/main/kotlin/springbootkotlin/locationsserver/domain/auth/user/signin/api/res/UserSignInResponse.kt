package springbootkotlin.locationsserver.domain.auth.user.signin.api.res

data class UserSignInResponse(
    val id: Long,
    val username: String,
    val emailAddress: String,
    val sessionExpiresAt: String // 세션 만료 시간 (ISO 8601 형식)
)