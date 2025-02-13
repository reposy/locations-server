// src/locationForm.js
import { saveLocation } from "/js/service/locationService.js";
import { qs, qsa } from "/js/users/common/utils.js";
import { store } from "/js/users/common/store.js";

let currentLocation = null;

/**
 * 폼 초기화 및 이벤트 등록
 * @param {Function} onSave - 저장 성공 후 콜백
 */
export const initForm = (onSave) => {
    const container = qs("#locationForm");
    if (!container) {
        console.error("locationForm 컨테이너를 찾을 수 없습니다.");
        return;
    }
    const defaultBlue = "#9BF6FF";
    const markerColorInput = qs("#markerColor");
    if (markerColorInput) markerColorInput.value = defaultBlue;

    const colorButtons = container.querySelectorAll(".color-button");
    // 초기: 기본 파란색 버튼 활성화
    colorButtons.forEach((btn) => {
        const btnColor = btn.getAttribute("data-color");
        if (btnColor === defaultBlue) {
            btn.classList.add("active", "ring-2", "ring-black");
        } else {
            btn.classList.remove("active", "ring-2", "ring-black");
        }
    });

    qsa('input[name="markerType"]').forEach((radio) =>
        radio.addEventListener("change", handleMarkerTypeChange)
    );
    colorButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            colorButtons.forEach((b) => b.classList.remove("active", "ring-2", "ring-black"));
            btn.classList.add("active", "ring-2", "ring-black");
            const newColor = btn.getAttribute("data-color");
            if (markerColorInput) markerColorInput.value = newColor;
            updateFormFromInputs();
        });
    });
    if (markerColorInput) {
        markerColorInput.addEventListener("input", () => {
            colorButtons.forEach((b) => b.classList.remove("active", "ring-2", "ring-black"));
            updateFormFromInputs();
        });
    }

    const saveBtn = qs("#saveLocationBtn");
    if (saveBtn) {
        saveBtn.addEventListener("click", async () => {
            if (!currentLocation?.latitude || !currentLocation?.longitude) {
                alert("위치를 먼저 선택해주세요.");
                return;
            }
            const nickname = qs("#nickname").value.trim();
            const address = qs("#address").value || "주소 미확인";
            const markerColor = markerColorInput ? markerColorInput.value : defaultBlue;
            const markerType = container.querySelector('input[name="markerType"]:checked')?.value || "default";
            const locationData = { ...currentLocation, nickname, address, markerColor, markerType };
            try {
                const savedLocation = await saveLocation(locationData);
                if (!savedLocation?.id) throw new Error("저장 후 ID가 반환되지 않았습니다.");
                alert(`위치 저장 성공! [ID: ${savedLocation.id}]`);
                onSave && onSave();
            } catch (error) {
                console.error(error.message);
                alert("오류 발생: " + error.message);
            }
        });
    }
    initializeNickname();
};

/** 마커 유형 변경 시 색상 영역 토글 및 폼 업데이트 */
const handleMarkerTypeChange = () => {
    const container = qs("#locationForm");
    if (!container) return;
    const markerType = container.querySelector('input[name="markerType"]:checked')?.value || "default";
    const markerColorWrapper = qs("#markerColorWrapper");
    if (markerColorWrapper) {
        markerType === "default"
            ? markerColorWrapper.classList.remove("hidden")
            : markerColorWrapper.classList.add("hidden");
    }
    initializeNickname();
    updateFormFromInputs();
};

/** 기본 닉네임 초기화 */
const initializeNickname = () => {
    const container = qs("#locationForm");
    if (!container) return;
    const selectedMarker = container.querySelector('input[name="markerType"]:checked');
    const nicknameInput = qs("#nickname");
    if (selectedMarker && nicknameInput) {
        const labelElement = selectedMarker.closest("label").querySelector("span:last-of-type");
        const labelText = labelElement ? labelElement.textContent.trim() : "위치";
        nicknameInput.value = `${labelText}: `;
    }
};

/** 폼 입력값 변화에 따라 폼 데이터 업데이트 */
const updateFormFromInputs = () => {
    updateForm();
};

/**
 * 폼 업데이트
 * 현재 입력값(색상, 마커 유형 등)을 반영하여 currentLocation 및 store의 locationFormData 업데이트
 * @param {Object} location (optional)
 * @returns {Object} 업데이트된 currentLocation
 */
export const updateForm = (location = {}) => {
    // 변경: 이전 currentLocation과 병합하지 않고 새 위치 객체로 대체
    currentLocation = { ...location };
    qs("#latitude").value = currentLocation.latitude || "";
    qs("#longitude").value = currentLocation.longitude || "";
    qs("#address").value = currentLocation.address || "";
    const markerColorInput = qs("#markerColor");
    currentLocation.markerColor = markerColorInput ? markerColorInput.value : "#9BF6FF";
    const markerTypeSelected = document.querySelector('input[name="markerType"]:checked');
    currentLocation.markerType = markerTypeSelected ? markerTypeSelected.value : "default";
    // store 업데이트: locationFormData 반영
    store.setState({ locationFormData: { ...currentLocation } });
    return currentLocation;
};