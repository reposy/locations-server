import { loadUserLocations } from "/js/service/locationService.js";
import eventBus from "/js/users/common/eventBus.js";

document.addEventListener("DOMContentLoaded", async () => {
    console.log("✅ location-list.js Loaded");

    await updateLocationList();

    // 📌 위치 저장될 때마다 목록 갱신
    eventBus.subscribe("locationSaved", async () => {
        await updateLocationList();
    });
});

// 📌 위치 목록을 새로 불러와서 갱신하는 함수
async function updateLocationList() {
    const locationListElement = document.getElementById("locationList");
    if (!locationListElement) {
        console.warn("📌 locationListElement를 찾을 수 없습니다.");
        return;
    }

    const locations = await loadUserLocations();
    locationListElement.innerHTML = "";

    locations.forEach((location) => {
        const row = document.createElement("tr");
        row.classList.add("border", "border-gray-300");

        row.innerHTML = `
            <td class="p-2">${location.nickname}</td>
            <td class="p-2">${location.address || "주소 없음"}</td>
        `;

        locationListElement.appendChild(row);
    });

    console.log("✅ 저장된 위치 목록 로드 완료");

    // 📌 이벤트 발생: 마커 업데이트 (`map.js`에서 처리)
    eventBus.publish("locationsUpdated", locations);
}