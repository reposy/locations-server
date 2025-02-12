import { loadUserLocations } from "/js/service/locationService.js";
import { focusOnLocation } from "/js/users/map.js"; // ✅ 지도에서 포커싱할 함수

/** 📌 현재 저장된 위치 목록 */
let savedLocations = [];

/** 📌 DOMContentLoaded 후 리스트 초기화 */
document.addEventListener("DOMContentLoaded", async () => {
    console.log("✅ location-list.js Loaded");
    await updateLocationList();
});

/** 📌 저장된 위치 목록 업데이트 */
const updateLocationList = async () => {
    const locationListElement = document.getElementById("locationList");

    if (!locationListElement) {
        console.error("📌 locationListElement를 찾을 수 없습니다.");
        return;
    }

    savedLocations = await loadUserLocations();
    console.log("📌 불러온 위치 목록:", savedLocations);

    if (!savedLocations || savedLocations.length === 0) {
        locationListElement.innerHTML = "<tr><td colspan='2' class='text-center p-2 text-gray-500'>저장된 위치가 없습니다.</td></tr>";
        return;
    }

    locationListElement.innerHTML = "";
    savedLocations.forEach((location) => {
        const row = document.createElement("tr");
        row.classList.add("border-b", "border-gray-300", "hover:bg-gray-100", "cursor-pointer");
        row.dataset.locationId = location.id;

        row.innerHTML = `
            <td class="p-2 flex items-center">
                <span class="w-5 h-5 inline-block rounded-full border border-gray-400 mr-2" style="background-color: ${location.markerColor};"></span>
                <span>${location.nickname}</span>
            </td>
            <td class="p-2 text-gray-700">${location.address || "주소 없음"}</td>
        `;

        // ✅ 리스트에서 클릭 시 해당 위치 선택
        row.addEventListener("click", () => {
            focusOnLocation(location);
            highlightSelectedRow(row);
        });

        locationListElement.appendChild(row);
    });
};

/** 📌 선택된 위치 강조 */
const highlightSelectedRow = (selectedRow) => {
    document.querySelectorAll("#locationList tr").forEach(row => {
        row.classList.remove("bg-blue-100");
    });

    selectedRow.classList.add("bg-blue-100");
};

export { updateLocationList };