package springbootkotlin.locationsserver.domain.group.repository

import org.springframework.data.jpa.repository.JpaRepository
import springbootkotlin.locationsserver.domain.group.entity.GroupChatMessage

interface GroupChatMessageRepository : JpaRepository<GroupChatMessage, Long> {
    fun findByGroupId(groupId: Long): List<GroupChatMessage>
}