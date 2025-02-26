package springbootkotlin.locationsserver.domain.group.websocket

import org.slf4j.LoggerFactory
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Controller
import springbootkotlin.locationsserver.domain.group.service.GroupMemberService

@Controller
class GroupLocationController(
    private val messagingTemplate: SimpMessagingTemplate,
    private val groupMemberService: GroupMemberService
) {
    private val logger = LoggerFactory.getLogger(GroupLocationController::class.java)

    @MessageMapping("/group/location.update")
    fun updateLocation(locationUpdate: LocationUpdate) {
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

        // 로그 출력
        logger.info("Location update received: $locationUpdate")

        // 클라이언트가 보낸 LocationUpdate 메시지를 해당 그룹의 토픽으로 브로드캐스트합니다.
        val destination = "/topic/group.location.${locationUpdate.groupId}"
        messagingTemplate.convertAndSend(destination, locationUpdate)
        logger.info("Message sent to destination: $destination")
    }
}

data class LocationUpdate(
    val groupId: Long,
    var userId: Long? = null,
    val latitude: Double,
    val longitude: Double,
)