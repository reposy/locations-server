const fetchClientId = async () => {
    try {
        const response = await fetch("/api/naver/map/client-id");
        if (!response.ok) throw new Error("📌 네이버 지도 Client ID를 가져오는 데 실패했습니다.");
        const data = await response.json();
        return data.clientId; // ✅ 서버에서 가져온 clientId 반환
    } catch (error) {
        console.error(error.message);
        return null;
    }
};

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
            console.log("✅ 네이버 지도 API 로드 완료");
            resolve();
        };

        script.onerror = () => {
            console.error("📌 Naver Map API 로드 실패");
            reject(new Error("네이버 지도 API 로드 실패"));
        };

        document.body.appendChild(script);
    });
};

export const initNaverMap = async () => {
    try {
        const clientId = await fetchClientId(); // ✅ 서버에서 clientId 가져오기
        if (!clientId) {
            throw new Error("📌 네이버 지도 Client ID를 가져올 수 없습니다.");
        }

        await loadNaverMapScript(clientId);

        const map = new naver.maps.Map("map", {
            center: new naver.maps.LatLng(37.3595704, 127.105399),
            zoom: 13,
        });

        console.log("✅ 네이버 지도 초기화 완료");
        return map;
    } catch (error) {
        console.error(error.message);
        return null;
    }
};