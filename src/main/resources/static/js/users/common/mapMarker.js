/**
 * 📌 네이버 맵 마커 생성 함수 (showInfoWindow 호출 X)
 */
export const createMarker = (naverMap, location) => {
    if (!naverMap) {
        console.error("📌 네이버 맵이 초기화되지 않았습니다.");
        return null;
    }

    const markerType = location.markerType || "default";
    const markerColor = location.markerColor || "#00FF00";

    return new naver.maps.Marker({
        position: new naver.maps.LatLng(location.latitude, location.longitude),
        map: naverMap,
        icon: {
            url: generateMarkerSVG(markerType, markerColor),
            size: new naver.maps.Size(24, 36),
            scaledSize: new naver.maps.Size(24, 36),
            anchor: new naver.maps.Point(12, 36),
        },
        title: location.nickname || location.address || "새 위치",
    });
};

/**
 * 📌 마커 정보창 생성
 */
export const createInfoWindow = (content) => {
    return new naver.maps.InfoWindow({
        content: `<div class="bg-white p-2 shadow-md rounded">${content}</div>`,
        disableAnchor: true,
    });
};

/**
 * 📌 마커 정보창 열기
 */
export const openInfoWindow = (naverMap, infoWindow, marker) => {
    infoWindow.open(naverMap, marker);
};

/**
 * 📌 SVG 기반 마커 생성 (색상 또는 아이콘 반영)
 */
const generateMarkerSVG = (markerType, color) => {
    return markerType === "default" ? generatePinMarkerSVG(color) : generateIconMarkerSVG(markerType);
};

/**
 * 📌 기본 마커 (핀 형태) SVG 생성
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
 * 📌 아이콘 마커 SVG 생성
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
 * 📌 마커 타입에 따른 이모지 반환
 */
const getMarkerEmoji = (markerType) => {
    const markerIcons = {
        "cafe": "☕",
        "restaurant": "🍽️",
        "store": "🏪",
        "gas": "⛽",
        "parking": "🅿️"
    };
    return markerIcons[markerType] || "📍";
};

/**
 * 📌 SVG 문자열을 Data URL로 변환
 */
const svgToDataURL = (svg) => {
    return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
};

/**
 * 📌 저장된 위치 리스트에서 사용할 마커 아이콘을 반환
 */
export const getMarkerIcon = (markerType, color) => {
    return markerType === "default"
        ? `<span class="w-5 h-5 rounded-full border border-gray-400 inline-block" style="background-color: ${color};"></span>`
        : `<span class="text-lg">${getMarkerEmoji(markerType)}</span>`;
};