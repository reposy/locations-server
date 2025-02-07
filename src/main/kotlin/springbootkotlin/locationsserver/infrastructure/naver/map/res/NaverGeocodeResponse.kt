package springbootkotlin.locationsserver.infrastructure.map.api.res

data class NaverGeocodeResponse(
    val status: String,
    val addresses: List<Address>
) {
    data class Address(
        val roadAddress: String?,
        val jibunAddress: String?,
        val x: String, // 경도
        val y: String  // 위도
    )
}