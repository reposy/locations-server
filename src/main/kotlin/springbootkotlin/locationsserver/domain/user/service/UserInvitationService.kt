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

        // 이미 그룹원인지 검사
        val alreadyMember = groupMemberService.isMember(invitation.toUser.id, invitation.group.id)
        if (alreadyMember) {
            // 이미 가입되어 있다면 상태를 DECLINED로 바꾸고 저장
            invitation.status = InvitationStatus.DUPLICATE_DECLIEND
            userInvitationRepository.save(invitation)
            // 여기서 return - 이미 DECLINED 된 invitation을 반환
            return invitation
        }

        // 아직 그룹 미가입인 경우 -> 정상 수락 처리
        invitation.status = InvitationStatus.ACCEPTED
        groupMemberService.addMember(invitation.group, invitation.toUser)
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