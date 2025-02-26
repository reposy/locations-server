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
        const openGroupInviteModalBtn = document.getElementById("openGroupInviteModalBtn");
        if (openGroupInviteModalBtn) {
            openGroupInviteModalBtn.addEventListener("click", () => {
                eventBus.emit("openGroupInviteModal");
            });
        } else {
            console.error("openGroupInviteModalBtn not found");
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
    const currentUserId = store.getState().currentUserId;
    // 현재 사용자의 위치 업데이트는 locationUpdater.js에서 처리하므로,
    // 여기서는 다른 사용자의 위치만 처리합니다.
    if (update.userId === currentUserId) {
        console.log("내 위치 업데이트는 locationUpdater에서 처리됩니다.");
        return;
    }
    // 타 사용자: 녹색 마커
    const markerColor = "#00FF00";
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

        // 대표 멤버(예: 첫 번째 멤버)와 토글 아이콘을 포함하는 컨테이너 생성
        const headerDiv = document.createElement("div");
        headerDiv.className = "flex items-center justify-between p-2 bg-white rounded shadow";

        // 대표 멤버 이름 표시 (예: 첫 번째 멤버)
        if (members.length > 0) {
            const repName = document.createElement("span");
            repName.textContent = members[0].nickname;
            repName.className = "font-semibold";
            headerDiv.appendChild(repName);
        } else {
            // 멤버가 없는 경우
            const emptyMsg = document.createElement("span");
            emptyMsg.textContent = "참여 인원이 없습니다.";
            headerDiv.appendChild(emptyMsg);
        }

        // 토글 버튼: 삼각형 아이콘
        const toggleBtn = document.createElement("button");
        toggleBtn.className = "focus:outline-none";
        // 기본은 삼각형 아래 아이콘 (전체 목록 보임을 암시)
        toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>`;
        headerDiv.appendChild(toggleBtn);

        // 부가: 전체 목록을 담을 드롭다운 컨테이너 (초기엔 숨김)
        const dropdown = document.createElement("div");
        dropdown.className = "mt-2 border border-gray-200 rounded hidden";
        members.forEach(member => {
            const item = document.createElement("div");
            item.className = "p-2 hover:bg-gray-100";
            item.textContent = member.nickname;
            dropdown.appendChild(item);
        });

        // 토글 버튼 클릭 시 드롭다운 표시/숨김 토글
        toggleBtn.addEventListener("click", () => {
            if (dropdown.classList.contains("hidden")) {
                dropdown.classList.remove("hidden");
                // 아이콘을 위쪽 삼각형으로 변경
                toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>`;
            } else {
                dropdown.classList.add("hidden");
                // 아이콘을 다시 아래쪽 삼각형으로 변경
                toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>`;
            }
        });

        // 전체 멤버 렌더링: 대표 정보와 드롭다운을 membersList에 추가
        membersList.appendChild(headerDiv);
        membersList.appendChild(dropdown);
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