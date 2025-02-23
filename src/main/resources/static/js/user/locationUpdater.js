// 파일 경로: /js/user/locationUpdater.js

import { store } from './store.js';
import { createMarker } from '/js/user/common/mapMarker.js';
import { sendLocationUpdate } from '/js/user/common/websocket.js';

let myLocationMarker = null;
let locationIntervalId = null;

/**
 * 주어진 좌표로 내 위치 마커를 업데이트하고, WebSocket으로 위치 전송
 * @param {number} latitude
 * @param {number} longitude
 */
function updateMyLocation(latitude, longitude) {
    const naverObj = store.getNaver();
    if (!naverObj) {
        console.error("글로벌 naver 객체가 store에 없습니다.");
        return;
    }
    const newPos = new naverObj.maps.LatLng(latitude, longitude);
    const naverMap = store.getNaverMap();
    if (naverMap) {
        // 최초 호출 시 지도의 중심을 내 위치로 이동
        naverMap.setCenter(newPos);
    }
    if (myLocationMarker) {
        myLocationMarker.setPosition(newPos);
        console.log("내 위치 마커 업데이트");
    } else if (naverMap) {
        myLocationMarker = createMarker(naverMap, {
            latitude,
            longitude,
            markerType: "default",
            markerColor: "#FF0000", // 내 위치: 빨간색
            nickname: "내 위치"
        });
        console.log("내 위치 마커 생성");
    }
    // 현재 사용자 ID는 store에서 관리 (없으면 기본 1 사용)
    const currentUserId = store.getState().currentUserId || 1;
    sendLocationUpdate({ userId: currentUserId, latitude, longitude });
}

/* 실시간 위치 공유 관련 함수 (10초마다 갱신, 최초 즉시 실행) */
export async function startLocationWatch() {
    if (!navigator.geolocation) {
        console.error("Geolocation API를 지원하지 않습니다.");
        return;
    }
    if (locationIntervalId !== null) {
        console.log("이미 위치 감시 중입니다.");
        return;
    }
    console.log("startLocationWatch 시작됨");

    // 최초 위치 업데이트 (즉시 실행)
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log("최초 위치:", latitude, longitude);
            updateMyLocation(latitude, longitude);
        },
        (error) => {
            console.error("최초 위치 요청 에러:", error);
        },
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    );

    // 이후 10초마다 위치 업데이트
    locationIntervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log("실시간 위치:", latitude, longitude);
                updateMyLocation(latitude, longitude);
            },
            (error) => {
                console.error("실시간 위치 추적 에러:", error);
            },
            { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
        );
    }, 10000);
}

export function stopLocationWatch() {
    if (locationIntervalId !== null) {
        clearInterval(locationIntervalId);
        locationIntervalId = null;
    }
    if (myLocationMarker) {
        myLocationMarker.setMap(null);
        myLocationMarker = null;
    }
}