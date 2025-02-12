import { initNaverMap } from "/js/naver/map/naver-map.js";
import { createInfoWindow, createMarker, openInfoWindow } from "/js/users/common/mapMarker.js";
import { getAddressFromCoords } from "/js/naver/map/reverse-geocode.js";

/** 📌 네이버 지도 객체 */
let naverMap = null;

/** 📌 현재 선택된 위치 정보 */
let focusedLocation = null;

/** 📌 현재 선택된 마커 */
let focusedMarker = null;

/** 📌 저장된 마커 목록 */
let savedMarkers = [];

/** 📌 DOMContentLoaded 후 지도 로드 */
document.addEventListener("DOMContentLoaded", async () => {
    console.log("✅ map.js Loaded");

    naverMap = await initNaverMap();
    if (!naverMap) {
        console.error("📌 네이버 지도 로드 실패");
        return;
    }
    console.log("✅ 네이버 지도 객체 초기화 완료");

    setupMapClickEvent();
});

/** 📌 지도 클릭 이벤트 설정 */
const setupMapClickEvent = () => {
    if (!naverMap) return;

    naver.maps.Event.addListener(naverMap, "click", async (e) => {
        const latitude = e.coord._lat;
        const longitude = e.coord._lng;
        console.log(`📍 지도 클릭됨: 위도 ${latitude}, 경도 ${longitude}`);

        // 📌 기본 마커 색상 & 타입 적용
        const markerType = document.querySelector('input[name="markerType"]:checked')?.value || "default";
        const markerColor = document.getElementById("markerColor")?.value || "#00FF00";

        // 📌 새로운 위치 설정
        focusedLocation = { latitude, longitude, markerType, markerColor };

        // 📌 주소 변환 후 폼 업데이트
        updateFormWithAddress(focusedLocation);

        // 📌 마커 생성 및 표시
        createMarkerForFocusedLocation(focusedLocation);
    });
};

/** 📌 선택한 위치의 마커 생성 */
const createMarkerForFocusedLocation = (location) => {
    if (!naverMap) return;

    // ✅ 기존 마커 제거
    if (focusedMarker) {
        focusedMarker.setMap(null);
    }

    // ✅ 새 마커 생성 및 지도에 추가
    focusedMarker = createMarker(naverMap, location);
    focusedMarker.setMap(naverMap);

    // ✅ 마커 클릭 시 정보창 표시
    naver.maps.Event.addListener(focusedMarker, "click", () => {
        openWindowForFocusedLocation(location);
    });

    // ✅ 처음 선택 시 정보창 자동 표시
    openWindowForFocusedLocation(location);
};

/** 📌 선택한 위치의 정보창 표시 */
const openWindowForFocusedLocation = (location) => {
    if (!location) return;

    const infoWindow = createInfoWindow(`${location.nickname || "새 위치"}<br>${location.address || "주소 없음"}`);
    openInfoWindow(naverMap, infoWindow, focusedMarker);
};

/** 📌 저장된 마커 추가 */
const addSavedMarker = (location) => {
    if (!naverMap) return;

    const marker = createMarker(naverMap, location);
    marker.setMap(naverMap);

    // ✅ 마커 클릭 이벤트 추가
    naver.maps.Event.addListener(marker, "click", () => {
        openWindowForFocusedLocation(location);
    });

    savedMarkers.push(marker);
};

/** 📌 저장된 위치의 마커 표시 */
const drawMarkers = (locations) => {
    if (!locations || locations.length === 0) return;

    // ✅ 기존 마커 삭제
    savedMarkers.forEach(marker => marker.setMap(null));
    savedMarkers = [];

    // ✅ 새로운 마커 등록
    locations.forEach(location => addSavedMarker(location));
};

/** 📌 폼에 주소 업데이트 (location-form.js에서 호출할 함수) */
const updateFormWithAddress = async (location) => {
    if (!location) return;

    const address = await getAddressFromCoords(location.latitude, location.longitude);
    location.address = address;

    const addressInput = document.getElementById("address");
    if (addressInput) {
        addressInput.value = address || "";
    }

    console.log("📌 폼에 주소 반영됨:", location);
};

/** 📌 리스트에서 클릭한 위치를 지도에서 포커싱 (location-list.js에서 호출) */
const focusOnLocation = (location) => {
    if (!naverMap) return;

    focusedLocation = location;

    if (focusedMarker) {
        focusedMarker.setMap(null);
    }

    focusedMarker = createMarker(naverMap, location);
    focusedMarker.setMap(naverMap);

    openWindowForFocusedLocation(location);
};

/** 📌 저장된 위치 목록이 변경될 때 마커 업데이트 (location-list.js에서 호출) */
const updateMarkersFromList = (locations) => {
    drawMarkers(locations);
};

export { updateFormWithAddress, focusOnLocation, updateMarkersFromList };