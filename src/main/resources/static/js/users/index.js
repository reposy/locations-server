// src/index.js
import { initMap, setFocusedMarker, updateMarkers } from "./map.js";
import { initForm, updateForm } from "./locationForm.js";
import { initList, updateList, highlightRow } from "./locationList.js";
import { loadUserLocations } from "/js/service/locationService.js";
import { store } from "/js/users/common/store.js";

document.addEventListener("DOMContentLoaded", async () => {
    console.log("index.js loaded");

    const refreshData = async () => {
        const locations = await loadUserLocations();
        updateMarkers(locations);
        updateList();
        store.setState({ savedLocations: locations });
    };

    // 지도 클릭 시, 폼 업데이트 후 해당 위치로 마커 생성
    await initMap((location) => {
        const updatedLocation = updateForm(location);
        setFocusedMarker(updatedLocation);
    });

    // 폼 초기화: 저장 후 refreshData 호출
    initForm(() => refreshData());

    // 리스트 초기화: 클릭 시 해당 위치로 포커스 및 하이라이트 처리
    initList((location, rowElement) => {
        setFocusedMarker(location);
        highlightRow(rowElement);
    });

    // "markerSelected" 이벤트 처리: 지도 마커 클릭 시 해당 리스트 row 활성화
    document.addEventListener("markerSelected", (e) => {
        const id = e.detail;
        const row = document.querySelector(`#locationList tr[data-location-id="${id}"]`);
        if (row) highlightRow(row);
    });

    // 최초 데이터 로드
    refreshData();
});