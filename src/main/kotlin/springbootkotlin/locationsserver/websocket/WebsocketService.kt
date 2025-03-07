package springbootkotlin.locationsserver.websocket

import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Lazy
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service
import springbootkotlin.locationsserver.domain.group.entity.GroupMember
import springbootkotlin.locationsserver.domain.group.service.GroupMemberService

@Service
class WebsocketService(
    private val messagingTemplate: SimpMessagingTemplate,
    @Lazy private val groupMemberService: GroupMemberService
) {
    private val logger = LoggerFactory.getLogger(WebsocketService::class.java)

    fun publishMemberUpdate(groupId: Long, members: List<GroupMember>) {
        // 엔티티 리스트를 DTO 리스트로 변환
        val memberDTOs = members.map { GroupMemberDTO.fromEntity(it) }
        val destination = "/topic/group.members.$groupId"
        messagingTemplate.convertAndSend(destination, memberDTOs)
    }

    fun processLocationUpdate(locationUpdate: LocationUpdate) {
        // 기본적인 유효성 검사
        if (locationUpdate.groupId < 0) {
            logger.error("잘못된 그룹 ID: ${locationUpdate.groupId}")
            return
        }
        if (locationUpdate.latitude == 0.0 && locationUpdate.longitude == 0.0) {
            logger.error("잘못된 위치 정보: ${locationUpdate.latitude}, ${locationUpdate.longitude}")
            return
        }
        // userId가 null인 경우 처리
        val userId = locationUpdate.userId
        if (userId == null) {
            logger.error("userId가 전달되지 않았습니다.")
            return
        }
        // 그룹에 해당 사용자가 멤버인지 확인합니다.
        if (!groupMemberService.isMember(userId, locationUpdate.groupId)) {
            logger.error("사용자 $userId 는 그룹 ${locationUpdate.groupId}의 멤버가 아닙니다.")
            return
        }

        logger.info("Location update received: $locationUpdate")

        // 위치 업데이트 메시지를 해당 그룹의 토픽으로 브로드캐스트합니다.
        val destinationLocation = "/topic/group.location.${locationUpdate.groupId}"
        messagingTemplate.convertAndSend(destinationLocation, locationUpdate)
        logger.info("Location update broadcasted to: $destinationLocation")

        // 최신 그룹 멤버 목록을 DTO로 변환하여 별도의 토픽으로 브로드캐스트합니다.
        val updatedMembers = groupMemberService.getMembersByGroupId(locationUpdate.groupId)
        publishMemberUpdate(locationUpdate.groupId, updatedMembers)
    }
}
data class GroupMemberDTO(
    val groupId: Long,
    val userId: Long,
    val nickname: String,
    val role: String
) {
    companion object {
        fun fromEntity(member: GroupMember): GroupMemberDTO {
            return GroupMemberDTO(
                groupId = member.group.id,
                userId = member.user.id,
                nickname = member.user.nickname,
                role = member.role.name
            )
        }
    }
}