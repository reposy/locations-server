package springbootkotlin.locationsserver.domain.user.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import springbootkotlin.locationsserver.domain.group.entity.Group
import springbootkotlin.locationsserver.domain.group.service.GroupMemberService
import springbootkotlin.locationsserver.domain.user.entity.UserInvitation
import springbootkotlin.locationsserver.domain.user.entity.InvitationStatus
import springbootkotlin.locationsserver.domain.user.entity.User
import springbootkotlin.locationsserver.domain.user.repository.UserInvitationRepository

@Service
@Transactional
class UserInvitationService(
    private val userInvitationRepository: UserInvitationRepository,
    private val groupMemberService: GroupMemberService
) {

    fun getUserInvitationById(invitationId: Long): UserInvitation? {
        return userInvitationRepository.findById(invitationId).orElse(null)
    }


    fun existsInvitation(fromUser: User, toUser: User, group: Group): Boolean {
        return userInvitationRepository.existsByGroupAndFromUserAndToUserAndStatus(
            group, fromUser, toUser, InvitationStatus.PENDING
        )
    }

    fun sendInvitation(invitation: UserInvitation): UserInvitation {
        if (existsInvitation(invitation.fromUser, invitation.toUser, invitation.group)) {
            throw IllegalStateException("이미 초대했습니다.")
        }
        return userInvitationRepository.save(invitation)
    }

    fun acceptInvitation(invitationId: Long): UserInvitation {
        val invitation = userInvitationRepository.findById(invitationId)
            .orElseThrow { IllegalArgumentException("Invitation not found") }
        invitation.status = InvitationStatus.ACCEPTED
        groupMemberService.addMember(invitation.group, invitation.toUser, isSharingLocation = false)
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