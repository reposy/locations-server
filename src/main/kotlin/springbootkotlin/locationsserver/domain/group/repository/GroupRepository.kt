package springbootkotlin.locationsserver.domain.group.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import springbootkotlin.locationsserver.domain.group.entity.Group

interface GroupRepository : JpaRepository<Group, Long> {
    @Query("select g from Group g left join fetch g.members where g.id = :groupId")
    fun findByIdWithMembers(@Param("groupId") groupId: Long): Group?
}