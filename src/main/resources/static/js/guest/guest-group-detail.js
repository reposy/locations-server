import { store } from './guest-store.js';
import { eventBus } from './guest-eventBus.js';
import { initNaverMap } from '../naver/map/naver-map.js';
import { createMarker } from '../naver/map/mapMarker.js';
import { initWebSocket, disconnectWebSocket, subscribeToGroupTopic } from '../service/websocketService.js';
import { startLocationWatch, stopLocationWatch } from './common/guestLocationUpdater.js';

let groupMarkers = {}; // 다른 사용자(멤버) 마커 저장

eventBus.on("contentLoaded", async (data) => {
    if (data && data.pageType === "guest-group-detail") {
        const groupId = store.getState().groupId;
        if (!groupId) {
            console.error("선택된 그룹 ID가 store에 없습니다.");
            window.location.href = "/users/signin";
            return;
        }
        await loadGroupDetail(groupId);

        try {
            const stompClient = await initWebSocket();
            if (stompClient && stompClient.connected) {
                subscribeToGroupTopic(groupId, handleLocationUpdate);
            }
        } catch (err) {
            console.error("WebSocket 초기화 실패:", err);
        }
    } else {
        // 그룹 상세 페이지가 아니면 WebSocket 연결 해제
        disconnectWebSocket();
    }
});

// WebSocket 메시지 처리: 다른 멤버들의 위치 업데이트 처리
function handleLocationUpdate(update) {
    console.log("WebSocket 위치 업데이트 수신:", update);
    const naverObj = store.getNaver();
    const map = store.getNaverMap();
    if (!naverObj || !map) {
        console.error("네이버 지도 관련 객체가 없습니다.");
        return;
    }
    const newPos = new naverObj.maps.LatLng(update.latitude, update.longitude);

    // 현재 사용자 정보가 있을 경우에만 비교 (게스트는 currentUser가 없을 수 있음)
    const guestId = store.getState().guestId;
    if (guestId && update.userId === guestId) {
        console.log("내 위치 업데이트는 locationUpdater에서 처리됩니다.");
        return;
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

// 그룹 상세 정보를 로드하고 화면에 렌더링하는 함수
async function loadGroupDetail(groupId) {
    try {
        const response = await fetch(`/api/guest/groups/${groupId}`, {
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
        // 페이지 타이틀 업데이트
        const pageTitleElem = document.getElementById("pageTitle");
        if (pageTitleElem) {
            pageTitleElem.textContent = `${data.name || "이름 없음"} - 그룹 상세`;
        } else {
            document.title = `${data.name || "이름 없음"} - 그룹 상세`;
        }

        // 내 위치 공유 토글 이벤트 재등록
        const toggleLocationElem = document.getElementById("toggleLocation");
        if (toggleLocationElem) {
            toggleLocationElem.removeEventListener("change", toggleLocationHandler);
            toggleLocationElem.addEventListener("change", toggleLocationHandler);
            toggleLocationElem.checked = false;
        } else {
            console.warn("toggleLocation 요소를 찾을 수 없습니다.");
        }

        // 지도 초기화: 게스트 페이지에서는 항상 새 지도 인스턴스로 초기화
        const mapContainer = document.getElementById("groupMap");
        if (!mapContainer) {
            console.error("groupMap 컨테이너를 찾을 수 없습니다.");
            return;
        }
        const map = await initNaverMap("groupMap");
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

// 그룹 멤버 목록을 로드하여 렌더링하는 함수
async function loadGroupMembers(groupId) {
    try {
        const response = await fetch(`/api/guest/groups/${groupId}/members`, {
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
        membersList.innerHTML = "";

        // 참여 인원 헤더 (대표 멤버와 전체 목록 토글)
        const headerDiv = document.createElement("div");
        headerDiv.className = "flex items-center justify-between p-2 bg-white rounded shadow";

        if (members.length > 0) {
            const repName = document.createElement("span");
            repName.textContent = members[0].nickname;
            repName.className = "font-semibold";
            headerDiv.appendChild(repName);
        } else {
            const emptyMsg = document.createElement("span");
            emptyMsg.textContent = "참여 인원이 없습니다.";
            headerDiv.appendChild(emptyMsg);
        }

        // 토글 버튼 (아래/위 삼각형 아이콘)
        const toggleBtn = document.createElement("button");
        toggleBtn.className = "focus:outline-none";
        toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>`;
        headerDiv.appendChild(toggleBtn);

        // 드롭다운 목록 (초기 숨김)
        const dropdown = document.createElement("div");
        dropdown.className = "mt-2 border border-gray-200 rounded hidden";
        members.forEach(member => {
            const item = document.createElement("div");
            item.className = "p-2 hover:bg-gray-100";
            item.textContent = member.nickname;
            dropdown.appendChild(item);
        });

        toggleBtn.addEventListener("click", () => {
            if (dropdown.classList.contains("hidden")) {
                dropdown.classList.remove("hidden");
                toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                                        </svg>`;
            } else {
                dropdown.classList.add("hidden");
                toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                        </svg>`;
            }
        });

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