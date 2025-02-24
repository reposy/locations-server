import { store } from './store.js';
import { eventBus } from './eventBus.js';
import { initNaverMap } from '/js/naver/map/naver-map.js';
import { createMarker } from '/js/user/common/mapMarker.js';
import { initWebSocket, disconnectWebSocket, subscribeToGroupTopic } from '/js/user/common/websocket.js';
import { startLocationWatch, stopLocationWatch } from './locationUpdater.js';

let groupMarkers = {}; // 그룹 내 다른 사용자 마커 저장

// contentLoaded 이벤트를 통해 페이지 타입을 감지하여 처리합니다.
eventBus.on("contentLoaded", async (data) => {
    if (data && data.pageType === "group-detail") {
        const groupId = store.getSelectedGroupId();
        if (!groupId) {
            console.error("선택된 그룹 ID가 store에 없습니다.");
            return;
        }
        await loadGroupDetail(groupId);

        // WebSocket 초기화 및 그룹 토픽 구독
        try {
            const stompClient = await initWebSocket();
            if (stompClient && stompClient.connected) {
                subscribeToGroupTopic(groupId, handleLocationUpdate);
            }
        } catch (err) {
            console.error("WebSocket 초기화 실패:", err);
        }
    } else {
        // 그룹 상세 페이지가 아니라면 WebSocket 연결 해제
        disconnectWebSocket();
    }
});

// WebSocket 메시지 처리: 위치 업데이트 수신
function handleLocationUpdate(update) {
    console.log("WebSocket 위치 업데이트 수신:", update);
    const naverObj = store.getNaver();
    const map = store.getNaverMap();
    if (!naverObj || !map) {
        console.error("네이버 지도 관련 객체가 없습니다.");
        return;
    }
    const newPos = new naverObj.maps.LatLng(update.latitude, update.longitude);
    if (update.isMine) {
        // 내 위치 업데이트는 locationUpdater.js에서 처리하므로 여기서는 생략
        console.log("내 위치 업데이트는 locationUpdater에서 처리됩니다.");
    } else {
        const markerColor = "#00FF00"; // 타 사용자: 녹색
        if (groupMarkers[update.userId]) {
            groupMarkers[update.userId].setPosition(newPos);
            console.log(`사용자 ${update.userId} 마커 업데이트 (WebSocket)`);
        } else {
            const marker = createMarker(map, {
                latitude: update.latitude,
                longitude: update.longitude,
                markerType: "default",
                markerColor: markerColor,
                nickname: update.nickname || "멤버 위치"
            });
            groupMarkers[update.userId] = marker;
            console.log(`사용자 ${update.userId} 마커 생성 (WebSocket)`);
        }
    }
}

async function loadGroupDetail(groupId) {
    try {
        const response = await fetch(`/api/groups/${groupId}`, {
            headers: { "Accept": "application/json" }
        });
        if (!response.ok) {
            throw new Error("그룹 상세 정보를 불러오지 못했습니다.");
        }
        const data = await response.json();
        console.log("그룹 상세 API 응답 데이터:", data);

        // 그룹 이름 업데이트
        const groupNameElem = document.getElementById("groupName");
        if (groupNameElem) {
            groupNameElem.textContent = data.name || "이름 없음";
        } else {
            console.error("groupName 요소를 찾을 수 없습니다.");
        }
        // 페이지 타이틀 업데이트 (pageTitle 요소가 있으면 사용, 없으면 document.title)
        const pageTitleElem = document.getElementById("pageTitle");
        if (pageTitleElem) {
            pageTitleElem.textContent = `${data.name || "이름 없음"} - 그룹 상세`;
        } else {
            document.title = `${data.name || "이름 없음"} - 그룹 상세`;
        }

        // toggleLocation 요소 이벤트 재등록
        const toggleLocationElem = document.getElementById("toggleLocation");
        if (toggleLocationElem) {
            toggleLocationElem.removeEventListener("change", toggleLocationHandler);
            toggleLocationElem.addEventListener("change", toggleLocationHandler);
            // 기본값 false (서버에 isSharingLocation 필드가 없으므로)
            toggleLocationElem.checked = false;
        } else {
            console.warn("toggleLocation 요소를 찾을 수 없습니다.");
        }

        // 그룹 상세 페이지의 새로운 지도 컨테이너 "groupMap"이 새로 생성되었으므로
        // 기존 지도 인스턴스는 더 이상 유효하지 않으므로 새로 초기화합니다.
        const mapContainer = document.getElementById("groupMap");
        if (!mapContainer) {
            console.error("groupMap 컨테이너를 찾을 수 없습니다.");
            return;
        }
        const map = await initNaverMap("groupMap"); // 항상 새 인스턴스로 초기화
        if (!map) {
            console.error("네이버 지도 초기화 실패");
            return;
        }
        store.setNaverMap(map);
        store.setNaver(window.naver);
        console.log("네이버 지도 초기화 완료");

        await loadGroupMembers(groupId);
    } catch (error) {
        console.error("Error loading group detail:", error);
    }
}

async function loadGroupMembers(groupId) {
    try {
        const response = await fetch(`/api/groups/${groupId}/members`, {
            headers: { "Accept": "application/json" }
        });
        if (!response.ok) {
            throw new Error("그룹 멤버 정보를 불러오지 못했습니다.");
        }
        const members = await response.json();
        console.log("그룹 멤버 API 응답:", members);
        const membersList = document.getElementById("membersList");
        if (!membersList) {
            console.error("membersList 요소를 찾을 수 없습니다.");
            return;
        }
        membersList.innerHTML = '';
        members.forEach(member => {
            const memberDiv = document.createElement("div");
            memberDiv.className = "p-4 bg-white rounded shadow";
            const nameP = document.createElement("p");
            nameP.className = "font-semibold";
            nameP.textContent = member.nickname;
            memberDiv.appendChild(nameP);
            membersList.appendChild(memberDiv);
        });
    } catch (error) {
        console.error("Error loading group members:", error);
    }
}

function toggleLocationHandler(e) {
    if (e.target.checked) {
        startLocationWatch();
    } else {
        stopLocationWatch();
    }
}