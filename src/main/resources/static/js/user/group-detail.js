import { store } from './store.js';
import { eventBus } from './eventBus.js';
import { initNaverMap } from '../naver/map/naver-map.js';
import { createMarker, createInfoWindow } from '../naver/map/mapMarker.js';
import { initWebSocket, disconnectWebSocket, subscribeToGroupTopic, subscribeToMemberUpdates } from '../service/websocketService.js';
import { startLocationWatch, stopLocationWatch } from './common/locationUpdater.js';

let groupMarkers = {}; // 그룹 내 다른 사용자(멤버) 마커 저장

eventBus.on("contentLoaded", async (data) => {
    if (data && data.pageType === "group-detail") {
        const groupId = store.getSelectedGroupId();
        if (!groupId) {
            console.error("선택된 그룹 ID가 store에 없습니다.");
            return;
        }
        // 그룹 상세 정보 로드
        const groupDetail = await loadGroupDetail(groupId);

        // 그룹 멤버 로드 후 현재 사용자가 멤버인지 체크
        const members = await loadGroupMembers(groupId);
        const currentUserId = store.getState().currentUser.id;
        const isMember = members.some(member => member.userId === currentUserId);
        if (!isMember) {
            alert("해당 그룹의 멤버가 아닙니다.");
            eventBus.emit("navigate", "/group-list");
            return;
        }

        // 그룹 소유자(방장) ID는 groupDetail.createUserId라고 가정
        const groupOwnerId = groupDetail.createUserId;

        // 그룹 주인만 초대 버튼 보이기
        const openGroupInviteModalBtn = document.getElementById("openGroupInviteModalBtn");
        const openGroupInviteLinkBtn = document.getElementById("openGroupInviteLinkBtn");
        console.log(`groupDetail.createUserId = ${groupOwnerId}, currentUserId = ${currentUserId}`);
        if (groupOwnerId !== currentUserId) {
            if (openGroupInviteModalBtn) openGroupInviteModalBtn.style.display = "none";
            if (openGroupInviteLinkBtn) openGroupInviteLinkBtn.style.display = "none";
        } else {
            if (openGroupInviteModalBtn) {
                openGroupInviteModalBtn.style.display = "";
                openGroupInviteModalBtn.addEventListener("click", () => {
                    eventBus.emit("openGroupInviteModal");
                });
            } else {
                console.error("openGroupInviteModalBtn not found");
            }
            if (openGroupInviteLinkBtn) {
                openGroupInviteLinkBtn.style.display = "";
                openGroupInviteLinkBtn.addEventListener("click", () => {
                    eventBus.emit("openGroupInviteLinkModal");
                });
            } else {
                console.error("openGroupInviteLinkBtn not found");
            }
        }

        // WebSocket 초기화 및 구독
        try {
            const stompClient = await initWebSocket();
            if (stompClient && stompClient.connected) {
                subscribeToGroupTopic(groupId, handleLocationUpdate);
                subscribeToMemberUpdates(groupId, handleMemberUpdate);
            }
        } catch (err) {
            console.error("WebSocket 초기화 실패:", err);
        }
    } else {
        disconnectWebSocket();
    }
});

// WebSocket 메시지 처리: 위치 업데이트 수신
function handleLocationUpdate(update) {
    console.log("Location update received:", update);
    const naverObj = store.getNaver();
    const map = store.getNaverMap();
    if (!naverObj || !map) {
        console.error("네이버 지도 관련 객체가 없습니다.");
        return;
    }
    const newPos = new naverObj.maps.LatLng(update.latitude, update.longitude);
    const currentUserId = store.getState().currentUser.id;
    if (update.userId === currentUserId) {
        console.log("내 위치 업데이트는 locationUpdater에서 처리됩니다.");
        return;
    }
    // 타 사용자: 녹색 마커 사용
    const markerColor = "#00FF00";
    if (groupMarkers[update.userId]) {
        // 기존 마커의 위치만 업데이트
        groupMarkers[update.userId].marker.setPosition(newPos);
        console.log(`사용자 ${update.userId} 마커 업데이트`);
    } else {
        // 새로운 사용자 마커 생성
        const marker = createMarker(map, {
            latitude: update.latitude,
            longitude: update.longitude,
            markerType: "default",
            markerColor: markerColor,
            nickname: update.nickname || "멤버 위치"
        });
        // 정보창 생성
        const infoContent = `<div style="padding:5px;">사용자: ${update.nickname || "알 수 없음"}</div>`;
        const infoWindow = createInfoWindow(infoContent);
        // 마커 클릭 시 정보창 열기 이벤트 등록
        naverObj.maps.Event.addListener(marker, 'click', () => {
            infoWindow.open(map, marker);
        });
        // groupMarkers 객체에 마커와 infoWindow를 함께 저장
        groupMarkers[update.userId] = { marker, infoWindow };
        console.log(`사용자 ${update.userId} 마커 생성`);
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
        // 페이지 타이틀 업데이트
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
            toggleLocationElem.checked = false;
        } else {
            console.warn("toggleLocation 요소를 찾을 수 없습니다.");
        }

        // 지도 초기화: 항상 새 지도 인스턴스로 초기화
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

        // 지도 클릭 시 모든 정보창 닫기
        window.naver.maps.Event.addListener(map, 'click', () => {
            for (const key in groupMarkers) {
                if (groupMarkers[key].infoWindow) {
                    groupMarkers[key].infoWindow.close();
                }
            }
        });

        // store에 map과 네이버 객체 저장 (window.naver 사용)
        store.setNaverMap(map);
        store.setNaver(window.naver);
        console.log("네이버 지도 초기화 완료");

        await loadGroupMembers(groupId);
        return data;
    } catch (error) {
        console.error("Error loading group detail:", error);
        return {};
    }
}

// 그룹 멤버 목록을 로드하여 렌더링하는 함수 (그룹 소유자 제외 및 강퇴 버튼 추가)
async function loadGroupMembers(groupId) {
    try {
        const response = await fetch(`/api/groups/${groupId}/members`, {
            headers: {"Accept": "application/json"}
        });
        if (!response.ok) {
            throw new Error("그룹 멤버 정보를 불러오지 못했습니다.");
        }
        const members = await response.json();
        console.log("그룹 멤버 API 응답:", members);

        const currentUserId = store.getState().currentUser.id
        if (!members.some(member => member.userId === currentUserId)) {
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

// 참여 인원 목록 업데이트 함수
function updateMemberList(members) {

    const currentUserId = store.getState().currentUser.id
    if (!members.some(member => member.userId === currentUserId)) {
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

    // API 응답 DTO에 role 정보가 있으므로,
    // 그룹 소유자(OWNER)와 일반 멤버(MEMBER)를 구분
    const ownerMember = members.find(member => member.role === "OWNER");
    const nonOwnerMembers = members.filter(member => member.role !== "OWNER");

    // 전체 참여 인원 수 (소유자 포함)
    const totalCount = members.length;

    // 1. 상단 헤더 업데이트: id="groupMemberHeader"가 있다면 업데이트
    const headerElem = document.getElementById("groupMemberHeader");
    if (headerElem) {
        headerElem.textContent = `참여 인원 (${totalCount}명)`;
    } else {
        console.warn("groupMemberHeader 요소를 찾을 수 없습니다.");
    }

    // 2. memberListContainer 구성은 "membersList" 내부에 추가합니다.
    //    첫 번째 행에는 그룹 소유자(방장) 정보와 오른쪽에 토글 버튼을 한 행에 배치
    const headerRow = document.createElement("div");
    headerRow.className = "flex items-center justify-between p-3 border-b";

    // 왼쪽: 그룹 소유자(방장) 정보 (항상 표시)
    const ownerSpan = document.createElement("span");
    ownerSpan.className = "font-bold text-base";
    if (ownerMember.userId === currentUserId)
        ownerSpan.textContent = ownerMember ? `${ownerMember.nickname} (방장/나)` : "방장 정보 없음";
    else
        ownerSpan.textContent = ownerMember ? `${ownerMember.nickname} (방장)` : "방장 정보 없음";

    headerRow.appendChild(ownerSpan);

    // 오른쪽: 토글 버튼 (초기 ▼)
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

    // 3. 드롭다운 목록: 소유자를 제외한 일반 멤버 목록 (기본적으로 숨김)
    const dropdown = document.createElement("div");
    dropdown.id = "memberDropdown";
    dropdown.className = "mt-2 border border-gray-200 rounded hidden";

    nonOwnerMembers.forEach(member => {
        const item = document.createElement("div");
        item.className = "flex items-center justify-between p-3 border-b";
        // 멤버 닉네임 표시
        const nameSpan = document.createElement("span");
        if(member.userId === currentUserId)
            nameSpan.textContent = `${member.nickname}(나)`;
        else
            nameSpan.textContent = member.nickname;
        nameSpan.className = "text-base";
        item.appendChild(nameSpan);

        // 강퇴 버튼: 현재 사용자가 그룹 소유자일 때만 표시
        // 강퇴 버튼은 오직 그룹 소유자(OWNER)가 있는 경우에만 보입니다.
        if (ownerMember.userId === currentUserId) {
            const kickBtn = document.createElement("button");
            kickBtn.className = "text-red-500 hover:text-red-700";
            kickBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" 
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                          d="M6 18L18 6M6 6l12 12"/>
                                  </svg>`;
            kickBtn.addEventListener("click", () => {
                if (confirm(`${member.nickname}님을 강제퇴장 시키겠습니까?`)) {
                    kickMember(member.userId);
                }
            });
            item.appendChild(kickBtn);
        }
        dropdown.appendChild(item);
    });
    container.appendChild(dropdown);

    // 4. 토글 버튼 클릭 이벤트: 드롭다운 목록 표시/숨김 전환
    toggleBtn.addEventListener("click", () => {
        if (dropdown.classList.contains("hidden")) {
            dropdown.classList.remove("hidden");
            // 위쪽 삼각형 아이콘
            toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" 
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                              d="M5 15l7-7 7 7" />
                                   </svg>`;
        } else {
            dropdown.classList.add("hidden");
            // 아래쪽 삼각형 아이콘
            toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" 
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                              d="M19 9l-7 7-7-7" />
                                   </svg>`;
        }
    });
}

// 강퇴 API 호출 함수
async function kickMember(memberId) {
    const groupId = store.getSelectedGroupId();
    try {
        const response = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
            method: "DELETE",
            headers: { "Accept": "application/json" }
        });
        if (!response.ok) {
            throw new Error("강퇴 요청 실패");
        }
        alert("강퇴되었습니다.");
        // 강퇴 후 멤버 목록 재로딩
        await loadGroupMembers(groupId);
    } catch (error) {
        console.error("강퇴 API 호출 오류:", error);
        alert("강퇴 처리 중 오류가 발생했습니다.");
    }
}

function toggleLocationHandler(e) {
    if (e.target.checked) {
        startLocationWatch();
    } else {
        stopLocationWatch();
    }
}