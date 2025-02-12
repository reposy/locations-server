import { saveLocation, loadUserLocations } from "/js/service/locationService.js";
import { drawMarkers } from "/js/users/map.js";
import { updateLocationList } from "/js/users/location-list.js";

/** 📌 현재 선택된 위치 정보 */
let focusedLocation = null;

/** 📌 DOMContentLoaded 후 폼 초기화 */
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ location-form.js Loaded");

    setupSaveLocationEvent();
    setupColorButtons();
    setupMarkerTypeChange();

    initializeNickname();
});

/** 📌 클릭한 위치의 주소를 받아와 폼 업데이트 */
const updateFormWithAddress = (location) => {
    if (!location) return;

    focusedLocation = location;

    document.getElementById("latitude").value = location.latitude || "";
    document.getElementById("longitude").value = location.longitude || "";
    document.getElementById("address").value = location.address || "";
};

/** 📌 닉네임 자동 설정 */
const initializeNickname = () => {
    const selectedMarker = document.querySelector('input[name="markerType"]:checked');
    const nicknameInput = document.getElementById("nickname");

    if (selectedMarker) {
        const labelElement = selectedMarker.closest("label").querySelector("span:last-of-type");
        const labelText = labelElement ? labelElement.textContent.trim() : "위치";
        nicknameInput.value = `${labelText}: `;
    }
};

/** 📌 마커 유형 변경 이벤트 처리 */
const handleMarkerTypeChange = () => {
    const markerType = document.querySelector('input[name="markerType"]:checked')?.value || "default";
    const markerColorWrapper = document.getElementById("markerColorWrapper");

    markerColorWrapper.classList.toggle("hidden", markerType !== "default");
    console.log(`📌 마커 타입 변경됨: ${markerType}`);
    initializeNickname();
};

/** 📌 색상 버튼 이벤트 설정 */
const setupColorButtons = () => {
    document.querySelectorAll(".color-button").forEach(button => {
        button.addEventListener("click", () => {
            document.getElementById("markerColor").value = button.getAttribute("data-color");
        });
    });

    document.getElementById("markerColor")?.addEventListener("input", (event) => {
        document.getElementById("markerColor").value = event.target.value;
    });
};

/** 📌 마커 유형 변경 감지 */
const setupMarkerTypeChange = () => {
    document.querySelectorAll('input[name="markerType"]').forEach(radio => {
        radio.addEventListener("change", handleMarkerTypeChange);
    });
};

/** 📌 위치 저장 */
const setupSaveLocationEvent = () => {
    document.getElementById("saveLocationBtn").addEventListener("click", async () => {
        if (!focusedLocation || !focusedLocation.latitude || !focusedLocation.longitude) {
            alert("📌 위치를 먼저 선택해주세요.");
            return;
        }

        console.log("✅ 저장할 위치 정보:", focusedLocation);

        const nickname = document.getElementById("nickname").value.trim();
        const address = document.getElementById("address").value || "주소 미확인";
        const markerColor = document.getElementById("markerColor")?.value || "#00FF00";
        const markerType = document.querySelector('input[name="markerType"]:checked')?.value || "default";

        try {
            const savedLocation = await saveLocation({
                nickname,
                address,
                latitude: focusedLocation.latitude,
                longitude: focusedLocation.longitude,
                markerColor,
                markerType
            });

            if (!savedLocation || !savedLocation.id) {
                throw new Error("❌ 위치 저장 후 ID가 반환되지 않았습니다.");
            }

            alert(`✅ 위치 저장 성공! [ID: ${savedLocation.id}]`);

            // ✅ 저장된 위치 리스트 갱신
            const updatedLocations = await loadUserLocations();
            updateLocationList(updatedLocations);
            drawMarkers(updatedLocations);

        } catch (error) {
            console.error("❌ 오류 발생:", error.message);
            alert("❌ 오류 발생: " + error.message);
        }
    });
};

export { updateFormWithAddress };