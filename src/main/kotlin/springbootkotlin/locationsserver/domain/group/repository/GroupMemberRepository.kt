package springbootkotlin.locationsserver.domain.group.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import springbootkotlin.locationsserver.domain.group.entity.GroupMember

@Repository
interface GroupMemberRepository : JpaRepository<GroupMember, Long> {
    fun findByGroupId(groupId: Long): List<GroupMember>
    fun existsByGroupIdAndUserId(groupId: Long, userId: Long): Boolean
    fun findByUserId(userId: Long): List<GroupMember>
}