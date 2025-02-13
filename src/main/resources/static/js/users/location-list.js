// static/js/users/location-list.js
import { loadUserLocations } from "/js/service/locationService.js";
import { getMarkerIcon } from "/js/users/common/mapMarker.js";

let listContainer = null;
let onSelectCallback = null;

const initList = (onSelect) => {
    listContainer = document.getElementById("locationList");
    if (!listContainer) {
        console.error("리스트 컨테이너를 찾을 수 없습니다.");
        return;
    }
    onSelectCallback = onSelect;
    updateList();
};

const updateList = async () => {
    if (!listContainer) return;
    const locations = await loadUserLocations();
    listContainer.innerHTML = "";
    if (!locations || locations.length === 0) {
        listContainer.innerHTML =
            "<tr><td colspan='2' class='text-center p-2 text-gray-500'>저장된 위치가 없습니다.</td></tr>";
        return;
    }
    locations.forEach((location) => {
        const row = document.createElement("tr");
        row.classList.add("border-b", "border-gray-300", "hover:bg-gray-100", "cursor-pointer");
        row.dataset.locationId = location.id;
        row.innerHTML = `
      <td class="p-2 flex items-center">
        ${getMarkerIcon(location.markerType || "default", location.markerColor || "#00FF00")}
        <span class="ml-2">${location.nickname}</span>
      </td>
      <td class="p-2 text-gray-700">${location.address || "주소 없음"}</td>
    `;
        row.addEventListener("click", () => {
            if (onSelectCallback) {
                onSelectCallback(location, row);
            }
        });
        listContainer.appendChild(row);
    });
};

const highlightRow = (selectedRow) => {
    document.querySelectorAll("#locationList tr").forEach((row) => {
        row.classList.remove("bg-blue-100");
    });
    selectedRow.classList.add("bg-blue-100");
};

export { initList, updateList, highlightRow };