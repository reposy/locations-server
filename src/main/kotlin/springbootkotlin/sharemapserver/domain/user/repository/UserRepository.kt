package springbootkotlin.sharemapserver.domain.user.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import springbootkotlin.sharemapserver.domain.user.entity.User

@Repository
interface UserRepository: JpaRepository<User, Long> {
    fun findByUsername(username: String): User?
    fun existsByNickname(nickName:String): Boolean
    fun existsByUsername(username: String): Boolean
    fun existsByEmailAddress(emailAddress: String): Boolean
}