import { store } from './store.js';
import { eventBus } from './eventBus.js';
import { initNaverMap } from '/js/naver/map/naver-map.js';
import { createMarker } from '/js/user/common/mapMarker.js';

let myLocationMarker = null;
let locationIntervalId = null;

eventBus.on("groupDetailRequested", async () => {
    const groupId = store.getSelectedGroupId();
    if (!groupId) {
        console.error("선택된 그룹 ID가 store에 없습니다.");
        return;
    }
    await loadGroupDetail(groupId);
});

document.addEventListener("DOMContentLoaded", () => {
    // 내 위치 공유 토글 이벤트 처리
    const toggleLocationElem = document.getElementById("toggleLocation");
    if (toggleLocationElem) {
        toggleLocationElem.addEventListener("change", (e) => {
            if (e.target.checked) {
                startLocationWatch();
            } else {
                stopLocationWatch();
            }
        });
    } else {
        console.warn("toggleLocation 요소를 찾을 수 없습니다.");
    }
});

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

        const groupNameElem = document.getElementById("groupName");
        if (groupNameElem) {
            groupNameElem.textContent = data.name || "이름 없음";
        } else {
            console.error("groupName 요소를 찾을 수 없습니다.");
        }
        const pageTitleElem = document.getElementById("pageTitle");
        if (pageTitleElem) {
            pageTitleElem.textContent = `${data.name || "이름 없음"} - 그룹 상세`;
        } else {
            document.title = `${data.name || "이름 없음"} - 그룹 상세`;
        }

        // toggleLocation 요소가 동적으로 로드된 후 이벤트 리스너 등록
        const toggleLocationElem = document.getElementById("toggleLocation");
        if (toggleLocationElem) {
            toggleLocationElem.removeEventListener("change", toggleLocationHandler);
            toggleLocationElem.addEventListener("change", toggleLocationHandler);
            toggleLocationElem.checked = false;
        } else {
            console.warn("toggleLocation 요소를 찾을 수 없습니다.");
        }

        let map = store.getNaverMap();
        if (!map) {
            map = await initNaverMap("groupMap");
            if (!map) {
                console.error("네이버 지도 초기화 실패");
                return;
            }
            store.setNaverMap(map);
            store.setNaver(window.naver);
        }
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

/* 실시간 위치 공유 관련 함수 (10초마다 갱신) */
async function startLocationWatch() {
    if (!navigator.geolocation) {
        console.error("Geolocation API를 지원하지 않습니다.");
        return;
    }
    if (locationIntervalId !== null) {
        console.log("이미 위치 감시 중입니다.");
        return;
    }

    console.log("startLocationWatch 시작됨");
    locationIntervalId = setInterval(() => {
        console.log("10초 간격 위치 요청 중...");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log("실시간 위치:", latitude, longitude);
                const naverObj = store.getNaver();
                if (!naverObj) {
                    console.error("글로벌 naver 객체가 store에 없습니다.");
                    return;
                }
                const newPos = new naverObj.maps.LatLng(latitude, longitude);
                if (myLocationMarker) {
                    myLocationMarker.setPosition(newPos);
                    console.log("마커 위치 업데이트");
                } else if (store.getNaverMap()) {
                    myLocationMarker = createMarker(store.getNaverMap(), {
                        latitude,
                        longitude,
                        markerType: "default",
                        markerColor: "#FF0000",
                        nickname: "내 위치"
                    });
                    console.log("마커 생성");
                }
            },
            (error) => {
                console.error("실시간 위치 추적 에러:", error);
            },
            { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
        );
    }, 10000);
}

function stopLocationWatch() {
    if (locationIntervalId !== null) {
        clearInterval(locationIntervalId);
        locationIntervalId = null;
    }
    if (myLocationMarker) {
        myLocationMarker.setMap(null);
        myLocationMarker = null;
    }
}