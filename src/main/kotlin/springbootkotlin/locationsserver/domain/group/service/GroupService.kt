package springbootkotlin.locationsserver.domain.group.service

import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import springbootkotlin.locationsserver.domain.group.entity.Group
import springbootkotlin.locationsserver.domain.group.repository.GroupRepository
import springbootkotlin.locationsserver.domain.group.service.GroupMemberService

@Service
@Transactional
class GroupService(
    private val groupRepository: GroupRepository,
    @Lazy private val groupMemberService: GroupMemberService
) {

    fun createGroup(group: Group): Group {
        return groupRepository.save(group)
    }

    fun updateGroupName(groupId: Long, newName: String): Group {
        val group = groupRepository.findById(groupId)
            .orElseThrow { IllegalArgumentException("Group not found") }
        group.changeName(newName)
        return groupRepository.save(group)
    }

    fun updateGroupMaxUsers(groupId: Long, newMax: Int): Group {
        val group = groupRepository.findById(groupId)
            .orElseThrow { IllegalArgumentException("Group not found") }
        group.updateMaxUsers(newMax)
        return groupRepository.save(group)
    }

    fun updateGroup(groupId: Long, newName: String, newMax: Int): Group {
        val group = groupRepository.findById(groupId)
            .orElseThrow { IllegalArgumentException("Group not found") }
        group.changeName(newName)
        group.updateMaxUsers(newMax)
        return groupRepository.save(group)
    }

    fun getGroupById(groupId: Long): Group {
        return groupRepository.findById(groupId)
            .orElseThrow { IllegalArgumentException("Group not found") }
    }

    /**
     * 제한적 삭제: 그룹 멤버 목록을 GroupMemberService를 통해 조회합니다.
     * 소유자(owner) 외에 다른 멤버가 있으면 삭제를 거부합니다.
     * 소유자만 남은 경우, 해당 그룹 멤버(소유자)를 먼저 삭제한 후 그룹을 삭제합니다.
     */
    fun deleteGroup(groupId: Long): Group {
        val group = groupRepository.findById(groupId)
            .orElseThrow { IllegalArgumentException("Group not found") }
        val members = groupMemberService.getMembersByGroupId(groupId)
        if (members.size > 1) {
            throw IllegalArgumentException("그룹에 다른 멤버가 존재하므로 삭제할 수 없습니다. 먼저 모든 멤버를 내보내주세요.")
        }
        // 소유자만 남은 경우, 먼저 그룹 멤버 레코드를 제거합니다.
        if (members.size == 1) {
            groupMemberService.removeMember(members.first().id!!)
        }
        groupRepository.delete(group)
        return group
    }
}