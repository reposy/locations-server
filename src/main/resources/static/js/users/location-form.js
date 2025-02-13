// static/js/users/location-form.js
import { saveLocation } from "/js/service/locationService.js";

let currentLocation = null;

const initForm = (onSave) => {
    const container = document.getElementById("locationForm");
    if (!container) {
        console.error("locationForm 컨테이너를 찾을 수 없습니다.");
        return;
    }

    // 기본 색상 설정: 파란색 (#9BF6FF)
    const defaultBlue = "#9BF6FF";
    const markerColorInput = document.getElementById("markerColor");
    if (markerColorInput) {
        markerColorInput.value = defaultBlue;
    }

    // 색상 버튼 초기화: 파란색 버튼은 active 상태로 표시 (Tailwind 클래스 적용)
    const colorButtons = container.querySelectorAll(".color-button");
    colorButtons.forEach((button) => {
        const btnColor = button.getAttribute("data-color");
        if (btnColor === defaultBlue) {
            button.classList.add("active", "ring-2", "ring-black");
        } else {
            button.classList.remove("active", "ring-2", "ring-black");
        }
    });

    // 마커 유형 변경 이벤트 처리
    const markerTypeRadios = container.querySelectorAll('input[name="markerType"]');
    markerTypeRadios.forEach((radio) => {
        radio.addEventListener("change", handleMarkerTypeChange);
    });

    // 색상 버튼 클릭 이벤트 처리
    colorButtons.forEach((button) => {
        button.addEventListener("click", () => {
            colorButtons.forEach((btn) => btn.classList.remove("active", "ring-2", "ring-black"));
            button.classList.add("active", "ring-2", "ring-black");
            const newColor = button.getAttribute("data-color");
            if (markerColorInput) {
                markerColorInput.value = newColor;
            }
        });
    });

    // 수동으로 색상을 변경할 경우 active 클래스 제거
    if (markerColorInput) {
        markerColorInput.addEventListener("input", () => {
            colorButtons.forEach((btn) => btn.classList.remove("active", "ring-2", "ring-black"));
        });
    }

    // 저장 버튼 클릭 이벤트 처리
    const saveBtn = document.getElementById("saveLocationBtn");
    if (saveBtn) {
        saveBtn.addEventListener("click", async () => {
            if (!currentLocation || !currentLocation.latitude || !currentLocation.longitude) {
                alert("위치를 먼저 선택해주세요.");
                return;
            }
            const nickname = document.getElementById("nickname").value.trim();
            const address = document.getElementById("address").value || "주소 미확인";
            const markerColor = markerColorInput ? markerColorInput.value : defaultBlue;
            const markerType = container.querySelector('input[name="markerType"]:checked')?.value || "default";
            const locationData = {
                ...currentLocation,
                nickname,
                address,
                markerColor,
                markerType,
            };
            try {
                const savedLocation = await saveLocation(locationData);
                if (!savedLocation || !savedLocation.id) {
                    throw new Error("위치 저장 후 ID가 반환되지 않았습니다.");
                }
                alert(`위치 저장 성공! [ID: ${savedLocation.id}]`);
                if (onSave) {
                    onSave();
                }
            } catch (error) {
                console.error(error.message);
                alert("오류 발생: " + error.message);
            }
        });
    }

    // 기본 닉네임 설정
    initializeNickname();
};

const handleMarkerTypeChange = () => {
    const container = document.getElementById("locationForm");
    if (!container) return;
    const markerType = container.querySelector('input[name="markerType"]:checked')?.value || "default";
    const markerColorWrapper = document.getElementById("markerColorWrapper");
    if (markerColorWrapper) {
        if (markerType === "default") {
            markerColorWrapper.classList.remove("hidden");
        } else {
            markerColorWrapper.classList.add("hidden");
        }
    }
    initializeNickname();
};

const initializeNickname = () => {
    const container = document.getElementById("locationForm");
    if (!container) return;
    const selectedMarker = container.querySelector('input[name="markerType"]:checked');
    const nicknameInput = document.getElementById("nickname");
    if (selectedMarker && nicknameInput) {
        const labelElement = selectedMarker.closest("label").querySelector("span:last-of-type");
        const labelText = labelElement ? labelElement.textContent.trim() : "위치";
        nicknameInput.value = `${labelText}: `;
    }
};

const updateForm = (location) => {
    currentLocation = { ...location };
    document.getElementById("latitude").value = location.latitude || "";
    document.getElementById("longitude").value = location.longitude || "";
    document.getElementById("address").value = location.address || "";

    const markerColorInput = document.getElementById("markerColor");
    const defaultBlue = "#9BF6FF";
    if (markerColorInput) {
        currentLocation.markerColor = markerColorInput.value;
    } else {
        currentLocation.markerColor = defaultBlue;
    }

    const markerTypeSelected = document.querySelector('input[name="markerType"]:checked');
    currentLocation.markerType = markerTypeSelected ? markerTypeSelected.value : "default";

    return currentLocation;
};

export { initForm, updateForm };