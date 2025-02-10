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

    // 📌 지도 클릭 이벤트 활성화
    setupLocationForm(naverMap);

    // 📌 저장 버튼 이벤트 핸들링
    setupSaveLocation();
});

// 📌 위치 저장 버튼 이벤트
const setupSaveLocation = () => {
    const saveLocationBtn = document.getElementById("saveLocationBtn");

    if (!saveLocationBtn) {
        console.warn("📌 saveLocationBtn을 찾을 수 없습니다.");
        return;
    }

    saveLocationBtn.addEventListener("click", async () => {
        const latitude = document.getElementById("latitude").value;
        const longitude = document.getElementById("longitude").value;
        const address = document.getElementById("address").value;

        if (!latitude || !longitude) {
            alert("📌 위치를 먼저 선택해주세요.");
            return;
        }

        try {
            // 📌 저장 요청 데이터 구성
            const requestData = {
                nickname: `사용자 위치 ${new Date().toLocaleString()}`,
                address: address || "주소 미확인",
                detailAddress: null,
                roadName: null,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            };

            // 📌 위치 저장 API 호출
            const response = await fetch("/api/locations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) throw new Error("위치 저장에 실패했습니다.");

            const savedLocation = await response.json();
            alert(`✅ 위치 저장 성공! [ID: ${savedLocation.id}]`);
        } catch (error) {
            console.error(error.message);
            alert(`❌ 오류 발생: ${error.message}`);
        }
    });
};