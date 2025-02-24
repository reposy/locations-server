package springbootkotlin.locationsserver.domain.group.websocket

import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Controller

data class LocationUpdate(
    val groupId: Long,
    var userId: Long? = null,
    val latitude: Double,
    val longitude: Double,
    // 클라이언트에서 isMine 값을 전달하거나, 별도로 처리할 수 있습니다.
    val isMine: Boolean? = false
)

@Controller
class GroupLocationController(
    private val messagingTemplate: SimpMessagingTemplate
) {

    @MessageMapping("/group/location.update")
    fun updateLocation(locationUpdate: LocationUpdate) {
        // 클라이언트가 보낸 LocationUpdate 메시지를 그대로 해당 그룹의 토픽으로 브로드캐스트합니다.
        val destination = "/topic/group.location.${locationUpdate.groupId}"
        messagingTemplate.convertAndSend(destination, locationUpdate)
    }
}