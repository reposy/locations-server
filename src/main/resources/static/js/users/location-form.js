import { getAddressFromCoords } from "/js/naver/map/reverse-geocode.js";

export const setupLocationForm = (naverMap) => {
    console.log("✅ Location Form Script Loaded");

    let activeMarker = null; // 현재 활성화된 마커 (하나만 유지)
    const menuLayer = document.createElement("div");
    menuLayer.style.position = "absolute";
    menuLayer.style.zIndex = "10000";
    menuLayer.style.backgroundColor = "#fff";
    menuLayer.style.border = "solid 1px #333";
    menuLayer.style.padding = "10px";
    menuLayer.style.display = "none";
    document.body.appendChild(menuLayer);

    // 📌 지도 클릭 이벤트: 기존 마커 삭제 후 새로운 마커 추가
    naver.maps.Event.addListener(naverMap, "click", async (e) => {
        const lat = e.coord._lat;
        const lng = e.coord._lng;

        console.log(`📍 클릭한 위치: 위도 ${lat}, 경도 ${lng}`);

        // 기존 마커가 있다면 삭제
        if (activeMarker) {
            activeMarker.setMap(null);
        }

        // 새로운 마커 추가
        activeMarker = new naver.maps.Marker({
            position: e.coord,
            map: naverMap,
        });

        // 선택한 위치 업데이트
        document.getElementById("latitude").value = lat;
        document.getElementById("longitude").value = lng;

        // 📌 주소 변환 기능 호출
        const address = await getAddressFromCoords(lat, lng);
        document.getElementById("address").value = address;
    });

    // 📌 키보드 이벤트: ESC 입력 시 모든 마커 삭제
    document.addEventListener("keydown", (e) => {
        const ESC = 27;

        if (e.keyCode === ESC) {
            e.preventDefault();

            if (activeMarker) {
                activeMarker.setMap(null);
                activeMarker = null;
            }

            menuLayer.style.display = "none";
            console.log("🗑️ 모든 마커 삭제");
        }
    });

    // 📌 마우스 우클릭 이벤트: 좌표 메뉴 표시
    naver.maps.Event.addListener(naverMap, "rightclick", (e) => {
        const lat = e.coord._lat;
        const lng = e.coord._lng;

        const coordHtml = `
            <strong>Coord:</strong> (${lat}, ${lng})<br />
            <strong>Point:</strong> ${e.point}<br />
            <strong>Offset:</strong> ${e.offset}
        `;

        menuLayer.style.left = `${e.offset.x}px`;
        menuLayer.style.top = `${e.offset.y}px`;
        menuLayer.innerHTML = coordHtml;
        menuLayer.style.display = "block";

        console.log(`📍 우클릭 위치: 위도 ${lat}, 경도 ${lng}`);
    });

    // 📌 마우스 클릭 시 메뉴 숨기기
    naver.maps.Event.addListener(naverMap, "mousedown", () => {
        menuLayer.style.display = "none";
    });
};