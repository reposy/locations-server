import { store } from './store.js';
import { eventBus } from './eventBus.js';

export function initGroupDetail() {
    let groupId = store.getSelectedGroupId();
    if (!groupId) {
        console.error("선택된 그룹 ID가 store에 없습니다.");
        eventBus.on("selectedGroupChanged", (id) => {
            if (id) {
                loadGroupDetail(id);
            }
        });
        return;
    }
    loadGroupDetail(groupId);
}

function loadGroupDetail(groupId) {
    fetch(`/api/groups/${groupId}`, {
        headers: { "Accept": "application/json" }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("그룹 상세 정보를 불러오지 못했습니다.");
            }
            return response.json();
        })
        .then(data => {
            console.log("그룹 상세 API 응답 데이터:", data);
            // 그룹 이름 업데이트
            const groupNameElem = document.getElementById("groupName");
            const pageTitleElem = document.getElementById("pageTitle");
            if (groupNameElem) {
                groupNameElem.textContent = data.name || "이름 없음";
            } else {
                console.error("groupName 요소를 찾을 수 없습니다.");
            }
            if (pageTitleElem) {
                pageTitleElem.textContent = `${data.name || "이름 없음"} - 그룹 상세`;
            } else {
                console.error("pageTitle 요소를 찾을 수 없습니다.");
            }

            // 토글은 그룹에 isSharingLocation 필드가 없으므로 기본 false로 처리
            const toggleLocationElem = document.getElementById("toggleLocation");
            if (toggleLocationElem) {
                toggleLocationElem.checked = false;
            } else {
                console.error("toggleLocation 요소를 찾을 수 없습니다.");
            }

            // 지도 초기화
            initMap();

            // 그룹 멤버 목록 로드
            loadGroupMembers(groupId);
        })
        .catch(error => {
            console.error("Error loading group detail:", error);
        });
}

function loadGroupMembers(groupId) {
    fetch(`/api/groups/${groupId}/members`, {
        headers: { "Accept": "application/json" }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("그룹 멤버 정보를 불러오지 못했습니다.");
            }
            return response.json();
        })
        .then(members => {
            console.log("그룹 멤버 API 응답:", members);
            const membersList = document.getElementById("membersList");
            if (membersList) {
                membersList.innerHTML = '';
                members.forEach(member => {
                    const memberDiv = document.createElement("div");
                    memberDiv.className = "p-4 bg-white rounded shadow";
                    const nameP = document.createElement("p");
                    nameP.className = "font-semibold";
                    nameP.textContent = member.nickname;  // 멤버 닉네임 표시
                    memberDiv.appendChild(nameP);
                    membersList.appendChild(memberDiv);
                });
            } else {
                console.error("membersList 요소를 찾을 수 없습니다.");
            }
        })
        .catch(error => {
            console.error("Error loading group members:", error);
        });
}

function initMap() {
    const mapContainer = document.getElementById("groupMap");
    if (!mapContainer) {
        console.error("groupMap 컨테이너를 찾을 수 없습니다.");
        return;
    }
    // TODO: 지도 API 초기화 코드 (예: 네이버/카카오 맵 API 연동)
    console.log("지도 초기화 코드 실행됨");
}