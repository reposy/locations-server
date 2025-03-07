import { store } from "../../user/store.js";

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

const fetchClientId = async () => {
    try {
        const isGuest = !store.getState().currentUser.id;
        const url = isGuest
            ? "/api/guest/naver/map/client-id"
            : "/api/naver/map/client-id";
        const response = await fetch(url);
        if (!response.ok) throw new Error("📌 네이버 지도 Client ID를 가져오는 데 실패했습니다.");
        const data = await response.json();
        return data.clientId;
    } catch (error) {
        console.error(error.message);
        return null;
    }
};

export const initNaverMap = async (containerId = "map") => {
    try {
        const clientId = await fetchClientId();
        if (!clientId) {
            throw new Error("네이버 지도 Client ID를 가져올 수 없습니다.");
        }
        await loadNaverMapScript(clientId);
        // naver 전역 변수가 정의될 때까지 대기
        await new Promise((resolve, reject) => {
            let checkCount = 0;
            const interval = setInterval(() => {
                if (window.naver) {
                    clearInterval(interval);
                    resolve();
                }
                checkCount++;
                if (checkCount > 50) {
                    clearInterval(interval);
                    reject(new Error("네이버 지도 API를 찾을 수 없습니다."));
                }
            }, 100);
        });
        const mapContainer = document.getElementById(containerId);
        if (!mapContainer) {
            throw new Error(`Container ${containerId} not found.`);
        }
        const map = new naver.maps.Map(mapContainer, {
            center: new naver.maps.LatLng(37.3595704, 127.105399),
            zoom: 13,
        });
        console.log("네이버 지도 초기화 완료");
        return map;
    } catch (error) {
        console.error(error.message);
        return null;
    }
};