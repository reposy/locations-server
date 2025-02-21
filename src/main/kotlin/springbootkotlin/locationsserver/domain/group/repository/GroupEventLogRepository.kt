package springbootkotlin.locationsserver.domain.group.repository

import org.springframework.data.jpa.repository.JpaRepository
import springbootkotlin.locationsserver.domain.group.entity.GroupEventLog

interface GroupEventLogRepository : JpaRepository<GroupEventLog, Long> {
    fun findByGroupId(groupId: Long): List<GroupEventLog>
}