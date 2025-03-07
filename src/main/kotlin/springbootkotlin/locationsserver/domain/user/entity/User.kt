package springbootkotlin.locationsserver.domain.user.entity

import jakarta.persistence.*
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import springbootkotlin.locationsserver.infrastructure.config.entity.AuditableEntity
import java.time.LocalDateTime

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true)
    @field:NotBlank(message = "Username cannot be blank")
    var username: String,

    @Column(nullable = false)
    var password: String,

    @Column(nullable = false, unique = true)
    var nickname: String,

    @Column(nullable = false, unique = true)
    @field:Email(message = "Invalid email address")
    var emailAddress: String,

    @Column(nullable = false, updatable = false)
    val joinedAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = true)
    var lastLoginedAt: LocalDateTime? = null,
): AuditableEntity()