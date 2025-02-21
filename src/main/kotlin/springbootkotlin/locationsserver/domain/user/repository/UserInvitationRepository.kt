package springbootkotlin.locationsserver.domain.user.repository

import org.springframework.data.jpa.repository.JpaRepository
import springbootkotlin.locationsserver.domain.user.entity.UserInvitation
import springbootkotlin.locationsserver.domain.user.entity.InvitationStatus

interface UserInvitationRepository : JpaRepository<UserInvitation, Long> {
    fun findByToUserIdAndStatus(userId: Long, status: InvitationStatus): List<UserInvitation>
}