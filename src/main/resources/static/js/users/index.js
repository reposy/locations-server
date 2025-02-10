// 📌 index.js (네이버 지도 객체 중앙 관리)
import { initNaverMap } from "/js/naver/map/naver-map.js";
import { setupLocationForm } from "./location-form.js";

document.addEventListener("DOMContentLoaded", async () => {
    console.log("✅ Index Script Loaded");

    // 네이버 지도 초기화 및 객체 가져오기
    const naverMap = await initNaverMap();

    if (!naverMap) {
        console.error("📌 네이버 지도 로드 실패");
        return;
    }

    console.log("✅ 네이버 지도 객체 관리 시작");

    // 📌 location-form.js에서 지도 객체를 활용할 수 있도록 넘겨줌
    setupLocationForm(naverMap);
});