package springbootkotlin.locationsserver.domain.group.api

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import springbootkotlin.locationsserver.domain.group.entity.GroupEventLog
import springbootkotlin.locationsserver.domain.group.service.GroupEventLogService
import springbootkotlin.locationsserver.domain.group.service.GroupService

@RestController
@RequestMapping("/api/groups/{groupId}/event-logs")
class GroupEventLogApiController(
    private val groupEventLogService: GroupEventLogService,
    private val groupService: GroupService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createEventLog(
        @PathVariable groupId: Long,
        @RequestBody request: CreateGroupEventLogRequest
    ): GroupEventLogResponse {
        val group = groupService.getGroupById(groupId)
        val eventLog = GroupEventLog(
            group = group,
            eventType = request.eventType,
            description = request.description
        )
        val savedEventLog = groupEventLogService.logEvent(eventLog)
        return GroupEventLogResponse.fromEntity(savedEventLog)
    }

    @GetMapping
    fun getEventLogs(@PathVariable groupId: Long): List<GroupEventLogResponse> {
        return groupEventLogService.getEventsByGroup(groupId)
            .map { GroupEventLogResponse.fromEntity(it) }
    }

    @PutMapping("/{eventId}")
    fun updateEventDescription(
        @PathVariable groupId: Long,
        @PathVariable eventId: Long,
        @RequestBody request: UpdateGroupEventLogRequest
    ): GroupEventLogResponse {
        val updatedEventLog = groupEventLogService.updateEventDescription(eventId, request.newDescription)
        return GroupEventLogResponse.fromEntity(updatedEventLog)
    }
}

// 요청 DTO
data class CreateGroupEventLogRequest(
    val eventType: String,
    val description: String
)

data class UpdateGroupEventLogRequest(
    val newDescription: String
)

// 응답 DTO
data class GroupEventLogResponse(
    val id: Long?,
    val groupId: Long,
    val eventType: String,
    val description: String,
    val createdAt: String?
) {
    companion object {
        fun fromEntity(entity: GroupEventLog): GroupEventLogResponse {
            return GroupEventLogResponse(
                id = entity.id,
                groupId = entity.group.id!!,
                eventType = entity.eventType,
                description = entity.description,
                createdAt = entity.createdAt.toString()
            )
        }
    }
}