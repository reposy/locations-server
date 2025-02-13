import { initNaverMap } from "/js/naver/map/naver-map.js";
import { createMarker, createInfoWindow, openInfoWindow } from "/js/users/common/mapMarker.js";
import { getAddressFromCoords } from "/js/naver/map/reverse-geocode.js";
import { store } from "/js/users/common/store.js";

let naverMap = null;
let focusedMarker = null;
let savedMarkers = [];

/**
 * 지도 초기화 및 클릭 시 onMapClick 콜백 실행
 * 클릭 시 선택된 위치를 store의 selectedLocation에 업데이트
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
        const location = { latitude, longitude, address };
        // 변경: 폼 데이터(formData)와 병합 시 새 좌표가 우선하도록 순서를 바꿈
        const formData = store.getState().locationFormData;
        const updatedLocation = { ...formData, ...location };
        store.setState({ selectedLocation: updatedLocation });
        onMapClick && onMapClick(updatedLocation);
    });
};

const clearFocusedMarker = () => {
    if (focusedMarker) {
        focusedMarker.setMap(null);
        focusedMarker = null;
    }
};

/**
 * 위치 정보를 기반으로 포커스 마커 생성
 * - 저장된 위치(id 있음): 정보창 표시 후 "markerSelected" 이벤트 디스패치
 * - 미저장 위치: 단순 마커만 표시
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
        document.dispatchEvent(new CustomEvent("markerSelected", { detail: location.id }));
    }
};

/**
 * 저장된 위치 목록에 따른 마커 업데이트
 * store의 savedLocations도 업데이트
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
    store.setState({ savedLocations: locations });
};