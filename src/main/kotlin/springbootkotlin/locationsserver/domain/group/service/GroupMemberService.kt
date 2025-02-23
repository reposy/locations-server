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

    // 그룹에 참여한 멤버인지 확인 (접근 권한)
    fun isMember(userId: Long, groupId: Long): Boolean {
        return groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)
    }

    // 그룹 소유자인지 확인 (수정/삭제 권한)
    fun isOwner(userId: Long, groupId: Long): Boolean {
        val group: Group = groupService.getGroupById(groupId)
        return group.createUser.id == userId
    }

    /**
     * 그룹에 새 멤버를 추가합니다.
     */
    fun addMember(group: Group, user: User, isSharingLocation: Boolean): GroupMember {
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
        return groupMemberRepository.findByGroupId(groupId)
    }

    /**
     * 특정 사용자에 속한 그룹 목록을 조회합니다.
     */
    fun getGroupsByUserId(userId: Long): List<Group> {
        return groupMemberRepository.findByUserId(userId).map { it.group }
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

    /**
     * 그룹 멤버를 제거합니다.
     */
    fun removeMember(memberId: Long) {
        groupMemberRepository.deleteById(memberId)
    }
}