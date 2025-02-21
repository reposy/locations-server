package springbootkotlin.locationsserver.domain.group.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import springbootkotlin.locationsserver.domain.group.entity.Group
import springbootkotlin.locationsserver.domain.group.repository.GroupRepository

@Service
@Transactional
class GroupService(
    private val groupRepository: GroupRepository
) {


    /**
     * 새로운 그룹을 생성합니다.
     */
    fun createGroup(group: Group): Group {
        return groupRepository.save(group)
    }

    /**
     * 그룹의 이름을 변경합니다.
     */
    fun updateGroupName(groupId: Long, newName: String): Group {
        val group = groupRepository.findById(groupId)
            .orElseThrow { IllegalArgumentException("Group not found") }
        group.changeName(newName)
        return groupRepository.save(group)
    }

    /**
     * 그룹의 최대 사용자 수를 업데이트합니다.
     */
    fun updateGroupMaxUsers(groupId: Long, newMax: Int): Group {
        val group = groupRepository.findById(groupId)
            .orElseThrow { IllegalArgumentException("Group not found") }
        group.updateMaxUsers(newMax)
        return groupRepository.save(group)
    }

    /**
     * 그룹 ID로 그룹 정보를 조회합니다.
     */
    fun getGroupById(groupId: Long): Group {
        return groupRepository.findById(groupId)
            .orElseThrow { IllegalArgumentException("Group not found") }
    }
}