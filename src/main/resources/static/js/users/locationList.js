// /js/users/locationList.js
import { loadUserLocations } from "/js/service/locationService.js";
import { getMarkerIcon } from "/js/users/common/mapMarker.js";
import { qs } from "/js/users/common/utils.js";

let listContainer = null;
let onSelectCallback = null;

/**
 * 리스트 초기화 및 이벤트 등록
 * @param {Function} onSelect - (location, rowElement) => {}
 */
export const initList = (onSelect) => {
    listContainer = qs("#locationList");
    if (!listContainer) {
        console.error("리스트 컨테이너를 찾을 수 없습니다.");
        return;
    }
    onSelectCallback = onSelect;
    updateList();
};

/**
 * 저장된 위치 목록을 서버에서 불러와 렌더링
 */
export const updateList = async () => {
    if (!listContainer) return;
    const locations = await loadUserLocations();
    listContainer.innerHTML = "";
    if (!locations || locations.length === 0) {
        listContainer.innerHTML = `<tr>
      <td colspan="4" class="text-center p-2 text-gray-500">저장된 위치가 없습니다.</td>
    </tr>`;
        return;
    }
    locations.forEach((location, index) => {
        const row = document.createElement("tr");
        row.className = "border-b border-gray-300 hover:bg-gray-100 cursor-pointer";
        row.dataset.locationId = location.id;
        row.innerHTML = `
      <td class="p-2 border border-gray-300 text-center">
        <button class="move-up text-blue-500 hover:text-blue-700" ${index === 0 ? "disabled" : ""}>&#9650;</button>
        <button class="move-down text-blue-500 hover:text-blue-700" ${index === locations.length - 1 ? "disabled" : ""}>&#9660;</button>
      </td>
      <td class="p-2 border border-gray-300">
        <span class="location-name" contenteditable="true">${location.nickname}</span>
      </td>
      <td class="p-2 border border-gray-300">${location.address || "주소 없음"}</td>
      <td class="p-2 border border-gray-300 text-center">
        <button class="delete-location bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded">삭제</button>
      </td>
    `;
        // 행 클릭: 선택된 위치로 포커싱 (단, 버튼 클릭 시 이벤트 중단)
        row.addEventListener("click", (e) => {
            if (e.target.closest("button")) return;
            onSelectCallback && onSelectCallback(location, row);
        });
        listContainer.appendChild(row);
    });
    attachListEvents();
};

/**
 * 각 행의 삭제, 순서 변경, 이름 편집 이벤트를 부착
 */
const attachListEvents = () => {
    // 삭제 기능
    listContainer.querySelectorAll(".delete-location").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (confirm("이 위치를 삭제하시겠습니까?")) {
                const row = e.target.closest("tr");
                const locationId = row.dataset.locationId;
                fetch(`/api/locations/${locationId}`, { method: "DELETE" })
                    .then((response) => {
                        if (response.ok) {
                            row.remove();
                        } else {
                            alert("삭제에 실패했습니다.");
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        alert("삭제 중 오류가 발생했습니다.");
                    });
            }
        });
    });

    // 순서 변경: 위/아래 버튼
    listContainer.querySelectorAll(".move-up").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const row = e.target.closest("tr");
            const prevRow = row.previousElementSibling;
            if (prevRow) {
                row.parentNode.insertBefore(row, prevRow);
                updateLocationOrder();
            }
        });
    });
    listContainer.querySelectorAll(".move-down").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const row = e.target.closest("tr");
            const nextRow = row.nextElementSibling;
            if (nextRow) {
                row.parentNode.insertBefore(nextRow, row);
                updateLocationOrder();
            }
        });
    });

    // 이름 변경: blur 이벤트 후 confirm
    listContainer.querySelectorAll(".location-name").forEach((span) => {
        span.addEventListener("blur", (e) => {
            const newName = span.textContent.trim();
            if (confirm("이름을 변경하시겠습니까?")) {
                const row = e.target.closest("tr");
                const locationId = row.dataset.locationId;
                fetch(`/api/locations/${locationId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nickname: newName })
                })
                    .then((response) => {
                        if (!response.ok) {
                            alert("이름 변경에 실패했습니다.");
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        alert("이름 변경 중 오류가 발생했습니다.");
                    });
            } else {
                // 변경 취소 시, 페이지를 새로고침하여 원래 이름 복원
                location.reload();
            }
        });
    });
};

/**
 * 순서 변경 후, 새로운 순서를 서버에 업데이트
 */
const updateLocationOrder = () => {
    const order = Array.from(listContainer.querySelectorAll("tr")).map((row, index) => ({
        id: row.dataset.locationId,
        order: index
    }));
    fetch(`/api/locations/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order })
    })
        .then((response) => {
            if (!response.ok) {
                alert("순서 업데이트에 실패했습니다.");
            }
        })
        .catch((err) => {
            console.error(err);
            alert("순서 업데이트 중 오류가 발생했습니다.");
        });
};

export const highlightRow = (selectedRow) => {
    qs("#locationList").querySelectorAll("tr").forEach((row) => {
        row.classList.remove("bg-blue-100");
    });
    selectedRow.classList.add("bg-blue-100");
};