package springbootkotlin.locationsserver.config.entity

import jakarta.persistence.Column
import jakarta.persistence.EntityListeners
import jakarta.persistence.MappedSuperclass
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.LocalDateTime

@MappedSuperclass
@EntityListeners(AuditingEntityListener::class)
abstract class AuditableEntity {

    @CreatedDate
    @Column(nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()

    @LastModifiedDate
    @Column(nullable = false)
    var lastModifiedAt: LocalDateTime = LocalDateTime.now()

    @Column(nullable = false)
    var isDeleted: Boolean = false // ✅ 논리적 삭제 여부 필드 추가

    @Column(nullable = true)
    var deletedAt: LocalDateTime? = null // ✅ 삭제된 시간 (NULL이면 미삭제)

    fun logicalDelete() {
        this.isDeleted = true
        this.deletedAt = LocalDateTime.now()
    }

    fun restore() {
        this.isDeleted = false
        this.deletedAt = null
    }

}