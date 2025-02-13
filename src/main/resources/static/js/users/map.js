// static/js/users/map.js
import { initNaverMap } from "/js/naver/map/naver-map.js";
import { createMarker, createInfoWindow, openInfoWindow } from "/js/users/common/mapMarker.js";
import { getAddressFromCoords } from "/js/naver/map/reverse-geocode.js";

let naverMap = null;
let focusedMarker = null;
let savedMarkers = [];

/**
 * 지도 초기화 및 클릭 시 콜백(onMapClick) 호출
 * @param {Function} onMapClick - 지도 클릭 시 호출: (location) => {}
 */
const initMap = async (onMapClick) => {
    naverMap = await initNaverMap();
    if (!naverMap) {
        console.error("네이버 지도 초기화 실패");
        return;
    }
    // 지도 클릭 이벤트 등록
    naver.maps.Event.addListener(naverMap, "click", async (e) => {
        const latitude = e.coord._lat;
        const longitude = e.coord._lng;
        const address = await getAddressFromCoords(latitude, longitude);
        // 아직 저장되지 않은 위치: id 없음
        const location = { latitude, longitude, address };
        if (onMapClick) {
            onMapClick(location);
        }
    });
};

/**
 * 기존 포커스 마커 제거
 */
const clearFocusedMarker = () => {
    if (focusedMarker) {
        focusedMarker.setMap(null);
        focusedMarker = null;
    }
};

/**
 * 지정된 위치 정보로 포커스 마커 생성
 * - 저장된 위치(즉, location.id가 있을 때)는 정보창을 띄우고,
 * - 미저장 위치는 단순히 마커만 표시합니다.
 * 또한, 저장된 마커가 클릭된 경우 해당 위치의 id를 담은 커스텀 이벤트 "markerSelected"를 디스패치합니다.
 * @param {Object} location - { latitude, longitude, nickname, address, markerColor, markerType, id? }
 */
const setFocusedMarker = (location) => {
    if (!naverMap) return;
    clearFocusedMarker();
    focusedMarker = createMarker(naverMap, location);
    focusedMarker.setMap(naverMap);
    if (location.id) { // 저장된 위치인 경우에만 정보창 표시
        const infoWindow = createInfoWindow(
            `${location.nickname || "저장된 위치"}<br>${location.address || "주소 없음"}`
        );
        openInfoWindow(naverMap, infoWindow, focusedMarker);
        // 커스텀 이벤트 디스패치: 마커가 선택되었음을 알림
        const markerSelectedEvent = new CustomEvent("markerSelected", { detail: location.id });
        document.dispatchEvent(markerSelectedEvent);
    }
};

/**
 * 저장된 위치 목록을 기반으로 마커들을 업데이트
 * @param {Array} locations - 저장된 위치 배열
 */
const updateMarkers = (locations) => {
    savedMarkers.forEach((marker) => marker.setMap(null));
    savedMarkers = [];
    locations.forEach((location) => {
        const marker = createMarker(naverMap, location);
        marker.setMap(naverMap);
        // 저장된 마커는 클릭 시 setFocusedMarker를 호출 (위에서 이벤트 디스패치됨)
        naver.maps.Event.addListener(marker, "click", () => {
            setFocusedMarker(location);
        });
        savedMarkers.push(marker);
    });
};

export { initMap, setFocusedMarker, updateMarkers };