package springbootkotlin.locationsserver.domain.location.api.req

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

data class LocationSaveRequest(
    @field:NotBlank(message = "위치 이름은 필수입니다.")
    @field:Size(max = 100, message = "위치 이름은 최대 100자까지 가능합니다.")
    val nickname: String,

    @field:NotBlank(message = "주소는 필수입니다.")
    @field:Size(max = 255, message = "주소는 최대 255자까지 가능합니다.")
    val address: String,

    val detailAddress: String?,  // 상세 주소는 선택적

    val roadName: String?,  // 도로명 주소는 선택적

    @field:NotNull(message = "위도는 필수입니다.")
    val latitude: Double,

    @field:NotNull(message = "경도는 필수입니다.")
    val longitude: Double,
)