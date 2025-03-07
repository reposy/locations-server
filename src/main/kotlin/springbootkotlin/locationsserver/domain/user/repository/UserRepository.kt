package springbootkotlin.locationsserver.domain.user.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import springbootkotlin.locationsserver.domain.user.entity.User

@Repository
interface UserRepository: JpaRepository<User, Long> {
    fun findByUsername(username: String): User?
    fun existsByNickname(nickName:String): Boolean
    fun existsByUsername(username: String): Boolean
    fun existsByEmailAddress(emailAddress: String): Boolean
    fun existsByNicknameAndIdNot(nickname: String, id: Long): Boolean
    fun existsByEmailAddressAndIdNot(emailAddress: String, id: Long): Boolean

    @Query("""
        SELECT u FROM User u 
         WHERE ( u.nickname = :query
            OR u.emailAddress = :query )
           AND u.id <> :currentUserId
           AND NOT EXISTS ( SELECT 1 FROM GroupMember m WHERE m.group.id = :groupId AND m.user.id = u.id )
    """)
    fun searchUsersNotInGroup(
        @Param("query") query: String,
        @Param("currentUserId") currentUserId: Long,
        @Param("groupId") groupId: Long
    ): List<User>
}