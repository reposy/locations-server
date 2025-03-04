package springbootkotlin.locationsserver.domain.group.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import springbootkotlin.locationsserver.domain.group.entity.GroupMember
import springbootkotlin.locationsserver.domain.group.repository.GroupMemberRepository
import springbootkotlin.locationsserver.domain.group.entity.Group
import springbootkotlin.locationsserver.domain.group.entity.GroupMemberRole
import springbootkotlin.locationsserver.domain.user.entity.User
import springbootkotlin.locationsserver.websocket.WebsocketService
import java.time.LocalDateTime
import org.springframework.context.annotation.Lazy

@Service
@Transactional
class GroupMemberService(
    @Lazy private val groupService: GroupService,
    private val groupMemberRepository: GroupMemberRepository,
    private val websocketService: WebsocketService
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
    fun addMember(group: Group, user: User): GroupMember {
        // 그룹 소유자인지 확인: 그룹의 createUser와 추가하려는 user 비교
        val role = if (group.createUser.id == user.id)
            GroupMemberRole.OWNER
        else GroupMemberRole.MEMBER

        val member = GroupMember(
            group = group,
            user = user,
            joinedAt = LocalDateTime.now(),
            role = role
        )
        val savedMember = groupMemberRepository.save(member)

        // 멤버 추가 후 최신 멤버 목록 브로드캐스트
        val members = getMembersByGroupId(group.id)
        websocketService.publishMemberUpdate(group.id, members)

        return savedMember
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
     * 그룹 멤버를 제거합니다.
     */
    fun removeMember(requesterId: Long, groupId: Long, memberId: Long) {
        // 그룹 정보 조회
        val group = groupService.getGroupById(groupId)
        // 강퇴 요청자가 그룹 소유자인지 확인
        if (!isOwner(requesterId, groupId))
            throw IllegalArgumentException("해당 그룹의 소유자만 멤버를 강퇴할 수 있습니다.")

        // 그룹 소유자는 강퇴될 수 없음
        if (requesterId != group.createUser.id
            && group.createUser.id == memberId)
            throw IllegalArgumentException("그룹 소유자는 강퇴될 수 없습니다.")

        // 삭제할 멤버가 존재하는지 확인 후 삭제
        // 그룹 내에서 userId를 기준으로 멤버 찾기
        val member = groupMemberRepository.findByGroupIdAndUserId(groupId, memberId)
            ?: throw IllegalArgumentException("해당 멤버가 존재하지 않습니다: $memberId")

        groupMemberRepository.delete(member)

        // 최신 멤버 목록을 조회하고 WebSocket으로 브로드캐스트
        val updatedMembers = getMembersByGroupId(groupId)
        websocketService.publishMemberUpdate(groupId, updatedMembers)
    }

    /**
     * 특정 그룹에서 userId에 해당하는 멤버를 제거합니다.
     */
    fun removeMemberByUserId(groupId: Long, userId: Long) {
        val member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
            ?: throw IllegalArgumentException("그룹 멤버를 찾을 수 없습니다.")
        groupMemberRepository.delete(member)
        // 최신 멤버 목록 브로드캐스트 (필요하다면)
        val updatedMembers = getMembersByGroupId(groupId)
        websocketService.publishMemberUpdate(groupId, updatedMembers)
    }
}