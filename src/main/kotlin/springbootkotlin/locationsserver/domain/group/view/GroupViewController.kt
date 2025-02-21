package springbootkotlin.locationsserver.domain.group.view

import jakarta.servlet.http.HttpSession
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import springbootkotlin.locationsserver.domain.auth.user.dto.UserInfoDTO
import springbootkotlin.locationsserver.domain.auth.user.session.UserSessionService
import springbootkotlin.locationsserver.domain.group.service.GroupMemberService

@Controller
@RequestMapping("/groups")
class GroupViewController(
    private val groupMemberService: GroupMemberService,
    private val userSessionService: UserSessionService
) {

    @GetMapping("/{groupId}")
    fun groupDetailPage(
        @PathVariable groupId: Long,
        session: HttpSession
    ): String {
        // 세션에서 로그인한 사용자 정보를 가져옵니다.
        val userInfo: UserInfoDTO = userSessionService.getUserInfo(session)

        // 그룹 접근 권한 검증
        if (!groupMemberService.isUserAuthorizedForGroup(userInfo.id, groupId)) {
            throw IllegalArgumentException("Access denied: You are not authorized to view this group")
        }

        return "/group/group-detail" // /templates/group/group-detail.html 뷰 반환
    }
}