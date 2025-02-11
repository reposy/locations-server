import { getAddressFromCoords } from "/js/naver/map/reverse-geocode.js";
import { saveLocation } from "/js/service/locationService.js";
import eventBus from "/js/users/common/eventBus.js";ㅇ

let naverMap = null;
let activeMarker = null;

document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ location-form.js Loaded");

    // 📌 네이버 지도 로드 완료 이벤트 수신
    eventBus.subscribe("mapLoaded", (loadedMap) => {
        console.log("📌 네이버 지도 객체 수신 - location-form.js");
        naverMap = loadedMap;
        setupMapClickEvent();
        setupSaveLocationEvent();
    });
});

// 📌 지도 클릭 이벤트 설정
const setupMapClickEvent = () => {
    if (!naverMap) {
        console.error("📌 네이버 지도 객체가 아직 로드되지 않았습니다.");
        return;
    }

    naver.maps.Event.addListener(naverMap, "click", async (e) => {
        const lat = e.coord._lat;
        const lng = e.coord._lng;

        console.log(`📍 클릭한 위치: 위도 ${lat}, 경도 ${lng}`);

        if (activeMarker) {
            activeMarker.setMap(null);
        }

        activeMarker = new naver.maps.Marker({
            position: e.coord,
            map: naverMap,
        });

        document.getElementById("latitude").value = lat;
        document.getElementById("longitude").value = lng;

        const address = await getAddressFromCoords(lat, lng);
        document.getElementById("address").value = address;
    });
};

// 📌 위치 저장 버튼 이벤트 설정
const setupSaveLocationEvent = () => {
    document.getElementById("saveLocationBtn").addEventListener("click", async () => {
        const nickname = document.getElementById("nickname").value.trim();
        const latitude = document.getElementById("latitude").value;
        const longitude = document.getElementById("longitude").value;
        const address = document.getElementById("address").value;

        if (!latitude || !longitude) {
            alert("📌 위치를 먼저 선택해주세요.");
            return;
        }

        try {
            const locationData = {
                nickname: nickname || `사용자 위치 ${new Date().toLocaleString()}`,
                address: address || "주소 미확인",
                detailAddress: null,
                roadName: null,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            };

            const savedLocation = await saveLocation(locationData);
            if (!savedLocation) throw new Error("위치 저장 실패");

            alert(`✅ 위치 저장 성공! [ID: ${savedLocation.id}]`);

            // 📌 이벤트 발생: 목록 & 지도 업데이트 (`location-list.js`, `map.js`에서 처리)
            eventBus.publish("locationSaved", savedLocation);
        } catch (error) {
            console.error(error.message);
            alert(`❌ 오류 발생: ${error.message}`);
        }
    });
};