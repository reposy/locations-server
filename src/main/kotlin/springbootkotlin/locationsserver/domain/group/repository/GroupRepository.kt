package springbootkotlin.locationsserver.domain.group.repository

import org.springframework.data.jpa.repository.JpaRepository
import springbootkotlin.locationsserver.domain.group.entity.Group

interface GroupRepository : JpaRepository<Group, Long> {
    // 필요에 따라 추가적인 쿼리 메서드를 정의할 수 있습니다.
}