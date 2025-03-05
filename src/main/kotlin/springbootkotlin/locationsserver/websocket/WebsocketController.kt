package springbootkotlin.locationsserver.websocket

import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.stereotype.Controller

@Controller
class GroupLocationController(
    private val groupLocationService: WebsocketService
) {
    @MessageMapping("/group/location.update")
    fun updateLocation(locationUpdate: LocationUpdate) {
        groupLocationService.processLocationUpdate(locationUpdate)
    }
}

data class LocationUpdate(
    val groupId: Long,
    var userId: Long? = null,
    val nickname: String? = null,
    val latitude: Double,
    val longitude: Double,
)