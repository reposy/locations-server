// static/js/users/map.js
import { initNaverMap } from "/js/naver/map/naver-map.js";
import { createMarker, createInfoWindow, openInfoWindow } from "/js/users/common/mapMarker.js";
import { getAddressFromCoords } from "/js/naver/map/reverse-geocode.js";

/** @type {Object|null} 네이버 지도 객체 */
let naverMap = null;
/** @type {Object|null} 현재 포커스된 마커 */
let focusedMarker = null;
/** @type {Array} 저장된 마커 목록 */
let savedMarkers = [];

/**
 * 지도 초기화 및 클릭 시 콜백 실행
 * @param {Function} onMapClick - (location) => {}
 */
export const initMap = async (onMapClick) => {
    naverMap = await initNaverMap();
    if (!naverMap) {
        console.error("네이버 지도 초기화 실패");
        return;
    }
    naver.maps.Event.addListener(naverMap, "click", async (e) => {
        const latitude = e.coord._lat;
        const longitude = e.coord._lng;
        const address = await getAddressFromCoords(latitude, longitude);
        // 미저장 위치: id 없음
        const location = { latitude, longitude, address };
        onMapClick && onMapClick(location);
    });
};

/** 기존 포커스 마커 제거 */
const clearFocusedMarker = () => {
    if (focusedMarker) {
        focusedMarker.setMap(null);
        focusedMarker = null;
    }
};

/**
 * 위치 정보를 기반으로 포커스 마커 생성
 * - 저장된 위치(id 있음)는 정보창을 띄우고 커스텀 이벤트 "markerSelected" 디스패치
 * - 미저장 위치는 마커만 표시
 * @param {Object} location
 */
export const setFocusedMarker = (location) => {
    if (!naverMap) return;
    clearFocusedMarker();
    focusedMarker = createMarker(naverMap, location);
    focusedMarker.setMap(naverMap);
    if (location.id) {
        const infoWindow = createInfoWindow(
            `${location.nickname || "저장된 위치"}<br>${location.address || "주소 없음"}`
        );
        openInfoWindow(naverMap, infoWindow, focusedMarker);
        // 디스패치: 마커 선택 이벤트
        document.dispatchEvent(new CustomEvent("markerSelected", { detail: location.id }));
    }
};

/**
 * 저장된 위치 목록으로 마커 업데이트
 * @param {Array} locations
 */
export const updateMarkers = (locations) => {
    savedMarkers.forEach((marker) => marker.setMap(null));
    savedMarkers = [];
    locations.forEach((location) => {
        const marker = createMarker(naverMap, location);
        marker.setMap(naverMap);
        naver.maps.Event.addListener(marker, "click", () => setFocusedMarker(location));
        savedMarkers.push(marker);
    });
};