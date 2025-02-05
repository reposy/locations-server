package springbootkotlin.sharemapserver.domain.user.entity

import jakarta.persistence.*
import springbootkotlin.sharemapserver.config.entity.AuditableEntity
import java.time.LocalDateTime

@Entity
@Table(name = "users")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true)
    val username: String,

    @Column(nullable = false)
    val password: String,

    @Column(nullable = false, unique = true)
    val nickname: String,

    @Column(nullable = false, unique = true)
    val emailAddress: String,

    @Column(nullable = false, updatable = false)
    val joinedAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = true)
    var lastLoginedAt: LocalDateTime? = null,
): AuditableEntity()