package springbootkotlin.locationsserver.domain.user.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import springbootkotlin.locationsserver.domain.user.entity.UserInvitation
import springbootkotlin.locationsserver.domain.user.entity.InvitationStatus
import springbootkotlin.locationsserver.domain.user.repository.UserInvitationRepository

@Service
@Transactional
class UserInvitationService(
    private val userInvitationRepository: UserInvitationRepository
) {

    fun getUserInvitationById(invitationId: Long): UserInvitation? {
        return userInvitationRepository.findById(invitationId).orElse(null)
    }

    fun sendInvitation(invitation: UserInvitation): UserInvitation {
        // 초대 전 추가 검증 로직을 삽입할 수 있습니다.
        return userInvitationRepository.save(invitation)
    }

    fun acceptInvitation(invitationId: Long): UserInvitation {
        val invitation = userInvitationRepository.findById(invitationId)
            .orElseThrow { IllegalArgumentException("Invitation not found") }
        invitation.status = InvitationStatus.ACCEPTED
        return userInvitationRepository.save(invitation)
    }

    fun declineInvitation(invitationId: Long): UserInvitation {
        val invitation = userInvitationRepository.findById(invitationId)
            .orElseThrow { IllegalArgumentException("Invitation not found") }
        invitation.status = InvitationStatus.DECLINED
        return userInvitationRepository.save(invitation)
    }

    fun getPendingInvitationsForUser(userId: Long): List<UserInvitation> {
        return userInvitationRepository.findByToUserIdAndStatus(userId, InvitationStatus.PENDING)
    }
}