package springbootkotlin.locationsserver.domain.group.entity

import jakarta.persistence.*
import springbootkotlin.locationsserver.infrastructure.config.entity.AuditableEntity
import springbootkotlin.locationsserver.domain.user.entity.User

@Entity
@Table(name = "groups")
class Group(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "create_user_id", nullable = false)
    var createUser: User,

    @Column(nullable = false)
    var name: String,

    @Column(name = "max_users", nullable = false)
    var maxUsers: Int,

    // 양방향 연관관계: 그룹에 속한 멤버들
    @OneToMany(mappedBy = "group")
    var members: MutableList<GroupMember> = mutableListOf()

) : AuditableEntity() {

    /**
     * 그룹 이름을 변경합니다.
     * 이름은 빈 문자열일 수 없습니다.
     */
    fun changeName(newName: String) {
        if (newName.isBlank()) {
            throw IllegalArgumentException("Group name cannot be blank")
        }
        this.name = newName
    }

    /**
     * 최대 사용자 수를 업데이트합니다.
     * 최대 사용자 수는 0보다 커야 합니다.
     */
    fun updateMaxUsers(newMax: Int) {
        if (newMax <= 0) {
            throw IllegalArgumentException("Max users must be greater than 0")
        }
        this.maxUsers = newMax
    }
}