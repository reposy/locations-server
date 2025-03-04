package springbootkotlin.locationsserver.domain.user.repository

import org.springframework.data.jpa.repository.JpaRepository
import springbootkotlin.locationsserver.domain.group.entity.Group
import springbootkotlin.locationsserver.domain.user.entity.UserInvitation
import springbootkotlin.locationsserver.domain.user.entity.InvitationStatus
import springbootkotlin.locationsserver.domain.user.entity.User

interface UserInvitationRepository : JpaRepository<UserInvitation, Long> {
    fun deleteByGroup(group: Group)

    fun findByToUserIdAndStatus(userId: Long, status: InvitationStatus): List<UserInvitation>

    fun findByGroupIdAndToUserIdAndStatus(groupId: Long, toUserId: Long, status: InvitationStatus): UserInvitation?

    fun existsByGroupAndFromUserAndToUserAndStatus(
        group: Group,
        fromUser: User,
        toUser: User,
        status: InvitationStatus
    ): Boolean
}