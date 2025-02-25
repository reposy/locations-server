package springbootkotlin.locationsserver.domain.user.repository

import org.springframework.data.jpa.repository.JpaRepository
import springbootkotlin.locationsserver.domain.group.entity.Group
import springbootkotlin.locationsserver.domain.user.entity.UserInvitation
import springbootkotlin.locationsserver.domain.user.entity.InvitationStatus
import springbootkotlin.locationsserver.domain.user.entity.User

interface UserInvitationRepository : JpaRepository<UserInvitation, Long> {
    fun findByToUserIdAndStatus(userId: Long, status: InvitationStatus): List<UserInvitation>
    // 새로 추가: 그룹, fromUser, toUser, status가 일치하는 초대가 존재하는지 확인
    fun existsByGroupAndFromUserAndToUserAndStatus(
        group: Group,
        fromUser: User,
        toUser: User,
        status: InvitationStatus
    ): Boolean
}