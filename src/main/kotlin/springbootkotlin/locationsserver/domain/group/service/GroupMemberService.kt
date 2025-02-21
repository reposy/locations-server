package springbootkotlin.locationsserver.domain.group.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import springbootkotlin.locationsserver.domain.group.entity.GroupMember
import springbootkotlin.locationsserver.domain.group.repository.GroupMemberRepository
import springbootkotlin.locationsserver.domain.group.entity.Group
import springbootkotlin.locationsserver.domain.user.entity.User

@Service
@Transactional
class GroupMemberService(
    private val groupService: GroupService,
    private val groupMemberRepository: GroupMemberRepository
) {


    fun isUserAuthorizedForGroup(userId: Long, groupId: Long): Boolean {
        val group = groupService.getGroupById(groupId) ?: return false
        if (group.createUser.id == userId) return true
        val isMember = groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)
        return isMember
    }

    /**
     * 그룹에 새 멤버를 추가합니다.
     */
    fun addMember(group: Group, user: User, isSharingLocation: Boolean): GroupMember {
        // 필요한 경우 중복 가입 여부나 그룹 인원 제한에 대한 검증 로직을 추가할 수 있습니다.
        val member = GroupMember(
            group = group,
            user = user,
            isSharingLocation = isSharingLocation
        )
        return groupMemberRepository.save(member)
    }

    /**
     * 특정 그룹에 소속된 모든 멤버를 조회합니다.
     */
    fun getMembersByGroupId(groupId: Long): List<GroupMember> {
        return groupMemberRepository.findByGroup_Id(groupId)
    }

    /**
     * 그룹 멤버의 위치 공유 상태를 업데이트합니다.
     */
    fun updateSharingStatus(memberId: Long, newStatus: Boolean): GroupMember {
        val member = groupMemberRepository.findById(memberId)
            .orElseThrow { IllegalArgumentException("Group member not found with id: $memberId") }
        member.updateSharingStatus(newStatus)
        return groupMemberRepository.save(member)
    }
}