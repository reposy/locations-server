package springbootkotlin.locationsserver.domain.group.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import springbootkotlin.locationsserver.domain.group.entity.GroupMember

@Repository
interface GroupMemberRepository : JpaRepository<GroupMember, Long> {

    @Query("select gm from GroupMember gm join fetch gm.user where gm.group.id = :groupId")
    fun findMembersByGroupId(@Param("groupId") groupId: Long): List<GroupMember>
    fun findByGroupId(groupId: Long): List<GroupMember>
    fun existsByGroupIdAndUserId(groupId: Long, userId: Long): Boolean
    fun findByUserId(userId: Long): List<GroupMember>
    fun findByGroupIdAndUserId(groupId: Long, userId: Long): GroupMember?

}