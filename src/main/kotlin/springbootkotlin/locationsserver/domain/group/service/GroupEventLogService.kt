package springbootkotlin.locationsserver.domain.group.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import springbootkotlin.locationsserver.domain.group.entity.GroupEventLog
import springbootkotlin.locationsserver.domain.group.repository.GroupEventLogRepository

@Service
@Transactional
class GroupEventLogService(
    private val groupEventLogRepository: GroupEventLogRepository
) {

    /**
     * 새로운 그룹 이벤트 로그를 기록합니다.
     */
    fun logEvent(eventLog: GroupEventLog): GroupEventLog {
        return groupEventLogRepository.save(eventLog)
    }

    /**
     * 특정 그룹의 이벤트 로그를 조회합니다.
     */
    fun getEventsByGroup(groupId: Long): List<GroupEventLog> {
        return groupEventLogRepository.findByGroupId(groupId)
    }

    /**
     * 이벤트 로그의 설명을 업데이트합니다.
     */
    fun updateEventDescription(eventId: Long, newDescription: String): GroupEventLog {
        val eventLog = groupEventLogRepository.findById(eventId)
            .orElseThrow { IllegalArgumentException("Group event log not found") }
        eventLog.updateDescription(newDescription)
        return groupEventLogRepository.save(eventLog)
    }
}