// 📌 reverse-geocode.js (서버 API를 호출하여 좌표 → 주소 변환)
export const getAddressFromCoords = async (lat, lng) => {
    try {
        const response = await fetch(`/api/naver/map/reverse-geocode?lat=${lat}&lng=${lng}`);

        if (!response.ok) {
            throw new Error("📌 주소 변환 요청 실패");
        }

        const data = await response.json();
        console.log("📌 주소 변환 결과:", data);

        // 변환된 주소 가져오기
        const results = data.results;
        if (results.length > 0) {
            return `${results[0].region.area1.name} ${results[0].region.area2.name} ${results[0].land.name}`;
        } else {
            return "주소를 찾을 수 없습니다.";
        }
    } catch (error) {
        console.error(error.message);
        return "주소 변환 실패";
    }
};