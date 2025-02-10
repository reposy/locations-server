// 📌 naver-map.js (네이버 지도 초기화 및 export)

let naverMap = null;

// 네이버 지도 API 로드 및 초기화
const initNaverMap = async () => {
    try {
        const clientId = await fetchClientId();
        if (!clientId) {
            throw new Error("📌 Naver Map Client ID를 가져올 수 없습니다.");
        }

        console.log("✅ Naver Map API 로드 시작...");
        await loadNaverMapScript(clientId);
        naverMap = await createMap();
        return naverMap;
    } catch (error) {
        console.error(error.message);
        alert(error.message);
        return null;
    }
};

// 네이버 지도 객체 생성
const createMap = async () => {
    if (typeof naver === "undefined" || typeof naver.maps === "undefined") {
        throw new Error("📌 Naver Map API 로드 실패 (naver 객체 없음)");
    }

    console.log("✅ 네이버 지도 객체 생성 중...");

    return new naver.maps.Map("map", {
        center: new naver.maps.LatLng(37.3595704, 127.105399),
        zoom: 13,
    });
};

// Client ID 가져오기
const fetchClientId = async () => {
    try {
        const response = await fetch("/api/naver/map/client-id");
        if (!response.ok) throw new Error("📌 네이버 지도 Client ID를 가져오는 데 실패했습니다.");
        const data = await response.json();
        return data.clientId;
    } catch (error) {
        console.error(error.message);
        return null;
    }
};

// 네이버 지도 API 스크립트 동적 로드
const loadNaverMapScript = async (clientId) => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src*="maps.js"]`)) {
            console.log("✅ 네이버 지도 API가 이미 로드됨");
            return resolve();
        }

        const script = document.createElement("script");
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            console.log("✅ Naver Map API 로드 완료");
            resolve();
        };

        script.onerror = () => {
            console.error("📌 Naver Map API 로드 실패");
            reject(new Error("네이버 지도 API 로드 실패"));
        };

        document.body.appendChild(script);
    });
};

// 📌 네이버 지도 초기화 함수 export
export { initNaverMap };