package springbootkotlin.locationsserver.domain.guest.repository

import org.springframework.data.jpa.repository.JpaRepository
import springbootkotlin.locationsserver.domain.guest.entity.Guest

interface GuestRepository : JpaRepository<Guest, Long>