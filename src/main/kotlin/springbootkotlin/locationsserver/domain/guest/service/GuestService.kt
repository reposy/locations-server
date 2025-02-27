package springbootkotlin.locationsserver.domain.guest.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import springbootkotlin.locationsserver.domain.guest.entity.Guest
import springbootkotlin.locationsserver.domain.guest.repository.GuestRepository
import java.util.*

@Service
@Transactional
class GuestService(
    private val guestRepository: GuestRepository
) {
    fun createGuest(): Guest {
        val uuidPart = UUID.randomUUID().toString().substring(0, 8)
        val guestName = "Guest_$uuidPart"
        val guestEmail = "guest_$uuidPart@example.com"
        // id는 JPA가 자동 생성하도록 0 또는 null로 처리 (엔티티 설계에 따라 다름)
        val guest = Guest(
            id = 0,
            username = guestName,
            nickname = guestName,
            emailAddress = guestEmail
        )
        return guestRepository.save(guest)
    }
}