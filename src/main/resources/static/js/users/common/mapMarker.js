// static/js/users/common/mapMarker.js

/**
 * 네이버 맵 마커 생성 함수
 * @param {Object} naverMap - 네이버 지도 객체
 * @param {Object} location - { latitude, longitude, markerColor, markerType, ... }
 * @returns Marker instance
 */
export const createMarker = (naverMap, location) => {
    if (!naverMap) {
        console.error("네이버 맵이 초기화되지 않았습니다.");
        return null;
    }
    const markerType = location.markerType || "default";
    const markerColor = location.markerColor || "#00FF00"; // fallback
    // 기본 마커와 아이콘 마커의 크기를 구분합니다.
    const isDefault = markerType === "default";
    const iconSize = isDefault
        ? new naver.maps.Size(24, 36)
        : new naver.maps.Size(36, 48); // 아이콘 마커는 좀 더 크게
    const iconAnchor = isDefault
        ? new naver.maps.Point(12, 36)
        : new naver.maps.Point(18, 48);

    return new naver.maps.Marker({
        position: new naver.maps.LatLng(location.latitude, location.longitude),
        map: naverMap,
        icon: {
            url: generateMarkerSVG(markerType, markerColor),
            size: iconSize,
            scaledSize: iconSize,
            anchor: iconAnchor,
        },
        title: location.nickname || location.address || "새 위치",
    });
};

/**
 * 마커 정보창 생성 함수
 * @param {string} content - 정보창에 표시할 HTML 내용
 * @returns InfoWindow instance
 */
export const createInfoWindow = (content) => {
    return new naver.maps.InfoWindow({
        content: `<div class="bg-white p-2 shadow-md rounded">${content}</div>`,
        disableAnchor: true,
    });
};

/**
 * 마커 정보창 열기
 * @param {Object} naverMap - 네이버 지도 객체
 * @param {InfoWindow} infoWindow - InfoWindow 객체
 * @param {Marker} marker - Marker 객체
 */
export const openInfoWindow = (naverMap, infoWindow, marker) => {
    infoWindow.open(naverMap, marker);
};

/**
 * SVG 기반 마커 아이콘 생성
 * - markerType이 "default"이면 선택한 색상을 반영한 핀 SVG 생성
 * - 그 외에는 해당 아이콘(이모지) SVG 생성
 * @param {string} markerType - 마커 유형 ("default", "cafe", "restaurant", …)
 * @param {string} color - 기본 마커일 경우 적용할 색상 (예: "#9BF6FF")
 * @returns {string} - Data URL 형식의 SVG 아이콘
 */
const generateMarkerSVG = (markerType, color) => {
    return markerType === "default"
        ? generatePinMarkerSVG(color)
        : generateIconMarkerSVG(markerType);
};

/**
 * 기본 마커(핀 형태) SVG 생성 – 선택한 색상을 반영
 * @param {string} color - 색상 코드 (예: "#9BF6FF")
 * @returns {string} - Data URL 형식의 SVG
 */
const generatePinMarkerSVG = (color) => {
    const svg = `
    <svg width="36" height="48" viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="18" cy="46" rx="8" ry="3" fill="rgba(0,0,0,0.2)"/>
      <path d="M18 2 C5 2, 2 12, 2 22 C2 34, 18 46, 18 46 C18 46, 34 34, 34 22 C34 12, 31 2, 18 2 Z"
            fill="${color}" stroke="black" stroke-width="1.5"/>
      <circle cx="18" cy="18" r="6" fill="white" stroke="black" stroke-width="1"/>
    </svg>
  `;
    return svgToDataURL(svg);
};

/**
 * 아이콘 마커 SVG 생성 – 마커 유형에 따라 아이콘(이모지)을 사용
 * @param {string} markerType - 아이콘 마커 유형 (예: "cafe", "restaurant" 등)
 * @returns {string} - Data URL 형식의 SVG
 */
const generateIconMarkerSVG = (markerType) => {
    const icon = getMarkerEmoji(markerType);
    const svg = `
    <svg width="36" height="48" viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg">
      <text x="18" y="32" text-anchor="middle" font-size="28px" font-weight="bold" dominant-baseline="middle">
        ${icon}
      </text>
    </svg>
  `;
    return svgToDataURL(svg);
};

/**
 * 마커 유형에 따른 이모지 반환
 * @param {string} markerType
 * @returns {string} - 해당 유형의 이모지
 */
const getMarkerEmoji = (markerType) => {
    const markerIcons = {
        cafe: "☕",
        restaurant: "🍽️",
        store: "🏪",
        gas: "⛽",
        parking: "🅿️",
    };
    return markerIcons[markerType] || "📍";
};

/**
 * SVG 문자열을 Data URL로 변환
 * @param {string} svg - SVG 코드
 * @returns {string} - Data URL (base64 encoded)
 */
const svgToDataURL = (svg) => {
    return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
};

/**
 * 리스트에서 사용할 마커 아이콘 반환 (HTML 문자열)
 * - 기본 마커: 선택한 색상의 원
 * - 그 외: 해당 아이콘(이모지)
 * @param {string} markerType - 마커 유형
 * @param {string} color - 기본 마커일 경우 사용할 색상
 * @returns {string} - HTML 문자열
 */
export const getMarkerIcon = (markerType, color) => {
    return markerType === "default"
        ? `<span class="w-5 h-5 inline-block rounded-full border border-gray-400" style="background-color: ${color};"></span>`
        : `<span class="text-lg">${getMarkerEmoji(markerType)}</span>`;
};