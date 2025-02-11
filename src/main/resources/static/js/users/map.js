import { initNaverMap } from "/js/naver/map/naver-map.js";
import eventBus from "/js/users/common/eventBus.js";

let naverMap = null;
let markers = [];

document.addEventListener("DOMContentLoaded", async () => {
    console.log("✅ map.js Loaded");

    naverMap = await initNaverMap();
    if (!naverMap) {
        console.error("📌 네이버 지도 로드 실패");
        return;
    }

    console.log("✅ 네이버 지도 객체 초기화 완료");

    // 📌 지도 로드 완료 이벤트 발생
    eventBus.publish("mapLoaded", naverMap);

    // 📌 위치 목록이 업데이트될 때마다 마커 갱신
    eventBus.subscribe("locationsUpdated", updateLocationMarkers);

    // 📌 위치가 저장되면 새로운 마커 추가
    eventBus.subscribe("locationSaved", addNewMarker);
});

// 📌 기존 마커 제거 후 새 마커 추가 (녹색)
const updateLocationMarkers = (locations) => {
    clearMarkers();
    markers = locations.map(location => new naver.maps.Marker({
        position: new naver.maps.LatLng(location.latitude, location.longitude),
        map: naverMap,
        icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
            size: new naver.maps.Size(32, 32),
            scaledSize: new naver.maps.Size(32, 32),
        },
        title: location.nickname,
    }));
};

// 📌 새로 추가된 마커 (파란색)
const addNewMarker = (location) => {
    const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(location.latitude, location.longitude),
        map: naverMap,
        icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            size: new naver.maps.Size(32, 32),
            scaledSize: new naver.maps.Size(32, 32),
        },
        title: location.nickname,
    });
    markers.push(marker);
};

// 📌 모든 마커 제거
const clearMarkers = () => {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
};