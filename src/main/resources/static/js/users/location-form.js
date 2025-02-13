// static/js/users/location-form.js
import { saveLocation } from "/js/service/locationService.js";

/** @type {Object|null} 현재 선택된 위치 */
let currentLocation = null;

/** 유틸: DOM 요소 선택 (단일) */
const qs = (selector) => document.querySelector(selector);

/**
 * 폼 초기화
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
    if (markerColorInput) {
        markerColorInput.value = defaultBlue;
    }
    const colorButtons = container.querySelectorAll(".color-button");
    // 초기: 파란색 버튼 활성화
    colorButtons.forEach((btn) => {
        const btnColor = btn.getAttribute("data-color");
        if (btnColor === defaultBlue) {
            btn.classList.add("active", "ring-2", "ring-black");
        } else {
            btn.classList.remove("active", "ring-2", "ring-black");
        }
    });
    // 마커 유형 변경 이벤트
    container.querySelectorAll('input[name="markerType"]').forEach((radio) => {
        radio.addEventListener("change", handleMarkerTypeChange);
    });
    // 색상 버튼 클릭 이벤트
    colorButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            colorButtons.forEach((b) => b.classList.remove("active", "ring-2", "ring-black"));
            btn.classList.add("active", "ring-2", "ring-black");
            const newColor = btn.getAttribute("data-color");
            if (markerColorInput) markerColorInput.value = newColor;
        });
    });
    if (markerColorInput) {
        markerColorInput.addEventListener("input", () => {
            colorButtons.forEach((b) => b.classList.remove("active", "ring-2", "ring-black"));
        });
    }
    // 저장 버튼 클릭
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

/** 마커 유형 변경 시 색상 영역 토글 및 닉네임 초기화 */
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

/**
 * 폼 업데이트
 * 선택된 위치에 현재 폼의 markerColor와 markerType 값을 추가
 * @param {Object} location
 * @returns {Object} currentLocation 업데이트된 값
 */
export const updateForm = (location) => {
    currentLocation = { ...location };
    qs("#latitude").value = location.latitude || "";
    qs("#longitude").value = location.longitude || "";
    qs("#address").value = location.address || "";
    const markerColorInput = qs("#markerColor");
    currentLocation.markerColor = markerColorInput ? markerColorInput.value : "#9BF6FF";
    const markerTypeSelected = document.querySelector('input[name="markerType"]:checked');
    currentLocation.markerType = markerTypeSelected ? markerTypeSelected.value : "default";
    return currentLocation;
};