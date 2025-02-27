package springbootkotlin.locationsserver.domain.guest.entity

import jakarta.persistence.Entity
import jakarta.persistence.Table
import springbootkotlin.locationsserver.domain.user.entity.User
import java.time.LocalDateTime

@Entity
@Table(name = "guest_users")
class Guest(
    id: Long,
    username: String,
    nickname: String,
    emailAddress: String,
    joinedAt: LocalDateTime = LocalDateTime.now()
) : User(
    id = id,
    username = username,
    password = "",                    // 게스트는 비밀번호를 사용하지 않음
    nickname = nickname,
    emailAddress = emailAddress,
    joinedAt = joinedAt
)