// static/js/users/index.js
import { initMap, setFocusedMarker, updateMarkers } from "/js/users/map.js";
import { initForm, updateForm } from "/js/users/location-form.js";
import { initList, updateList, highlightRow } from "/js/users/location-list.js";
import { loadUserLocations } from "/js/service/locationService.js";

document.addEventListener("DOMContentLoaded", async () => {
    console.log("index.js loaded");

    const refreshData = async () => {
        const locations = await loadUserLocations();
        updateMarkers(locations);
        updateList();
    };

    // 지도 클릭 시 폼 업데이트 후, 선택한 위치에 대해 마커 생성
    await initMap((location) => {
        const updatedLocation = updateForm(location);
        setFocusedMarker(updatedLocation);
    });

    // 폼 초기화: 저장 성공 후 refreshData 호출
    initForm(() => refreshData());

    // 리스트 초기화: 클릭 시 해당 위치로 포커싱 및 정보창 표시
    initList((location, rowElement) => {
        setFocusedMarker(location);
        highlightRow(rowElement);
    });

    // 커스텀 이벤트 "markerSelected": 지도 마커 클릭 시 해당 리스트 row 활성화
    document.addEventListener("markerSelected", (e) => {
        const id = e.detail;
        const row = document.querySelector(`#locationList tr[data-location-id="${id}"]`);
        if (row) highlightRow(row);
    });

    // 최초 데이터 로드
    refreshData();
});