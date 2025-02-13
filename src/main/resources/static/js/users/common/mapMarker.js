/**
 * SVG 문자열을 Data URL로 변환
 * @param {string} svg
 * @returns {string}
 */
const svgToDataURL = (svg) =>
    "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));

/**
 * 기본 마커(핀) SVG 생성 – 선택한 색상 반영
 * @param {string} color - 예: "#9BF6FF"
 * @returns {string}
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
 * 아이콘 마커 SVG 생성 – 마커 유형에 따른 이모지 사용
 * @param {string} markerType - 예: "cafe", "restaurant"
 * @returns {string}
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
 * @returns {string}
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
 * SVG 기반 마커 아이콘 생성
 * - markerType이 "default"이면 선택한 색상을 반영한 핀 SVG 생성
 * - 그 외는 해당 아이콘 SVG 생성
 * @param {string} markerType
 * @param {string} color
 * @returns {string}
 */
export const generateMarkerSVG = (markerType, color) =>
    markerType === "default"
        ? generatePinMarkerSVG(color)
        : generateIconMarkerSVG(markerType);

/**
 * 네이버 맵 마커 생성 함수
 * @param {Object} naverMap
 * @param {Object} location - { latitude, longitude, markerColor, markerType, ... }
 * @returns Marker instance
 */
export const createMarker = (naverMap, location) => {
    if (!naverMap) {
        console.error("네이버 맵이 초기화되지 않았습니다.");
        return null;
    }
    const markerType = location.markerType || "default";
    const markerColor = location.markerColor || "#00FF00";
    const isDefault = markerType === "default";
    const iconSize = isDefault
        ? new naver.maps.Size(24, 36)
        : new naver.maps.Size(36, 48);
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
 * 정보창 생성 함수
 * @param {string} content
 * @returns {InfoWindow}
 */
export const createInfoWindow = (content) =>
    new naver.maps.InfoWindow({
        content: `<div class="bg-white p-2 shadow-md rounded">${content}</div>`,
        disableAnchor: true,
    });

/**
 * 정보창 열기 함수
 * @param {Object} naverMap
 * @param {InfoWindow} infoWindow
 * @param {Marker} marker
 */
export const openInfoWindow = (naverMap, infoWindow, marker) => {
    infoWindow.open(naverMap, marker);
};

/**
 * 리스트에 사용할 마커 아이콘 HTML 생성
 * - 기본 마커: 선택한 색상의 원,
 * - 그 외: 해당 아이콘(이모지)
 * @param {string} markerType
 * @param {string} color
 * @returns {string}
 */
export const getMarkerIcon = (markerType, color) =>
    markerType === "default"
        ? `<span class="w-5 h-5 inline-block rounded-full border border-gray-400" style="background-color: ${color};"></span>`
        : `<span class="text-lg">${getMarkerEmoji(markerType)}</span>`;