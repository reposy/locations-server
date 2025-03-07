import { store } from './guest-store.js';
import { eventBus } from './guest-eventBus.js';
import { initNaverMap } from '../naver/map/naver-map.js';
import {createInfoWindow, createMarker} from '../naver/map/mapMarker.js';
import {
    initWebSocket,
    disconnectWebSocket,
    subscribeToGroupTopic,
    subscribeToMemberUpdates,
    sendLocationUpdate
} from '../service/websocketService.js';
import { startLocationWatch, stopLocationWatch } from './common/guestLocationUpdater.js';

let groupMarkers = {}; // 그룹 내 다른 사용자(멤버) 마커 저장

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
                // 멤버 업데이트 토픽 구독 추가:
                subscribeToMemberUpdates(groupId, handleMemberUpdate);
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
    const guestId = store.getState().guestId;
    if (guestId && update.userId === guestId) {
        console.log("내 위치 업데이트는 guestLocationUpdater에서 처리됩니다.");
        return;
    } else {
        const markerColor = "#00FF00"; // 타 사용자: 녹색
        if (groupMarkers[update.userId]) {
            groupMarkers[update.userId].marker.setPosition(newPos);
            console.log(`사용자 ${update.userId} 마커 업데이트 (WebSocket)`);
        } else {
            const marker = createMarker(map, {
                latitude: update.latitude,
                longitude: update.longitude,
                markerType: "default",
                markerColor: markerColor,
                nickname: update.nickname || "멤버 위치"
            });
            // 추가: 정보창 생성
            const infoContent = `<div style="padding:5px;">사용자: ${update.nickname || "알 수 없음"}</div>`;
            const infoWindow = createInfoWindow(infoContent);
            // 마커 클릭 시 infoWindow 토글
            naverObj.maps.Event.addListener(marker, 'click', () => {
                if (infoWindow.isOpen && infoWindow.isOpen()) {
                    infoWindow.close();
                } else {
                    infoWindow.open(map, marker);
                }
            });
            // groupMarkers 객체에 마커와 infoWindow 함께 저장
            groupMarkers[update.userId] = { marker, infoWindow };
            console.log(`사용자 ${update.userId} 마커 생성 (WebSocket)`);
        }
    }
}

// WebSocket 메시지 처리: 최신 그룹 멤버 목록 업데이트 수신
function handleMemberUpdate(members) {
    console.log("Member update received:", members);
    updateMemberList(members);
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

        window.naver.maps.Event.addListener(map, 'click', () => {
            for (const key in groupMarkers) {
                if (groupMarkers[key].infoWindow) {
                    groupMarkers[key].infoWindow.close();
                }
            }
        });

        await loadGroupMembers(groupId);
        return data;
    } catch (error) {
        console.error("Error loading group detail:", error);
        return {};
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
        let members = await response.json();
        console.log("그룹 멤버 API 응답:", members);

        const guestId = store.getState().guestId
        if (!members.some(member => member.userId === guestId)) {
            alert("해당 그룹에 대한 접근 권한이 없습니다.")
            window.location.href = "/"
        }
        updateMemberList(members);
        return members;
    } catch (error) {
        console.error("Error loading group members:", error);
        return [];
    }
}

// 참여 인원 목록 업데이트 함수 (모바일 친화적 디자인)
// 상단에 "참여 인원 (총 N명)"을 표시하고,
// 그 아래 한 행에는 방장 정보와 토글 버튼이 배치되며,
// 토글 버튼 클릭 시 방장을 제외한 일반 멤버 목록(강퇴 버튼 없이)이 드롭다운으로 표시됨.
function updateMemberList(members) {

    const guestId = store.getState().guestId
    if (!members.some(member => member.userId === guestId)) {
        alert("해당 그룹에 대한 접근 권한이 없습니다.")
        window.location.href = "/"
    }
    // "membersList" 요소를 사용 (HTML에 <div id="membersList"> 존재)
    const container = document.getElementById("membersList");
    if (!container) {
        console.error("membersList 요소를 찾을 수 없습니다.");
        return;
    }
    container.innerHTML = ""; // 초기화

    const totalCount = members.length;

    // API 응답 DTO에서 role 정보를 이용하여 방장(OWNER)와 일반 멤버(MEMBER) 구분
    let ownerMember = members.find(member => member.role === "OWNER");
    // fallback: 만약 role 정보가 없으면 groupOwnerId와 비교

    if (!ownerMember) {
        console.warn("방장 정보가 없습니다.");
    }

    const nonOwnerMembers = members.filter(member => member.userId !== ownerMember.userId)

    // 1. 상단 헤더 업데이트: id="groupMemberHeader"가 있다면 업데이트
    const headerElem = document.getElementById("groupMemberHeader");
    if (headerElem) {
        headerElem.textContent = `참여 인원 (${totalCount}명)`;
    } else {
        console.warn("groupMemberHeader 요소를 찾을 수 없습니다.");
    }

    // 2. 상단 행 구성: 방장 정보와 토글 버튼을 한 행에 배치
    const headerRow = document.createElement("div");
    headerRow.className = "flex items-center justify-between p-3 border-b";

    const ownerSpan = document.createElement("span");
    ownerSpan.className = "font-bold text-base";
    ownerSpan.textContent = ownerMember
        ? `${ownerMember.nickname} (방장)`
        : "방장 정보 없음";
    headerRow.appendChild(ownerSpan);

    const toggleBtn = document.createElement("button");
    toggleBtn.id = "toggleMemberBtn";
    toggleBtn.className = "focus:outline-none";
    toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" 
                                  viewBox="0 0 24 24" stroke="currentColor">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                     d="M19 9l-7 7-7-7" />
                           </svg>`;
    headerRow.appendChild(toggleBtn);

    container.appendChild(headerRow);

    // 3. 드롭다운 목록 구성: 방장을 제외한 일반 멤버 목록 (초기에는 숨김)
    const dropdown = document.createElement("div");
    dropdown.id = "memberDropdown";
    dropdown.className = "mt-2 border border-gray-200 rounded hidden";
    console.log("guestId : " + guestId)
    console.log(JSON.stringify(nonOwnerMembers))
    nonOwnerMembers.forEach(member => {

        const item = document.createElement("div");
        item.className = "flex items-center justify-between p-3 border-b";
        const nameSpan = document.createElement("span");
        nameSpan.className = "text-base";
        if ( member.userId === guestId )
            nameSpan.textContent = `${member.nickname}(나)`;
        else
            nameSpan.textContent = member.nickname;
        item.appendChild(nameSpan);
        dropdown.appendChild(item);
    });
    container.appendChild(dropdown);

    // 4. 토글 버튼 클릭 이벤트: 드롭다운 목록 표시/숨김 전환
    toggleBtn.addEventListener("click", () => {
        if (dropdown.classList.contains("hidden")) {
            dropdown.classList.remove("hidden");
            // 위쪽 삼각형 아이콘 (▲)
            toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" 
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                              d="M5 15l7-7 7 7" />
                                   </svg>`;
        } else {
            dropdown.classList.add("hidden");
            // 아래쪽 삼각형 아이콘 (▼)
            toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" 
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                              d="M19 9l-7 7-7-7" />
                                   </svg>`;
        }
    });
}

function toggleLocationHandler(e) {
    const loadingIcon = document.getElementById("locationLoading");
    if (e.target.checked) {
        // 위치 공유 시작 시, 로딩 아이콘 보이기
        if (loadingIcon) {
            loadingIcon.classList.remove("hidden");
        }
        startLocationWatch();
    } else {
        // 위치 공유 해제 시, 로딩 아이콘 숨기기
        if (loadingIcon) {
            loadingIcon.classList.add("hidden");
        }
        stopLocationWatch();
        sendLocationUpdate({
            groupId: store.getState().groupId,
            userId: store.getState().guestId,
            locationSharing: false
        });
    }
}