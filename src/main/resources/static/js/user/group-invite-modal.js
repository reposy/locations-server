// 파일 경로: /js/user/group-invite-modal.js
import { eventBus } from './eventBus.js';
import { store } from './store.js';

let inviteModal = null; // 모달 요소를 전역 변수로 저장

document.addEventListener("DOMContentLoaded", () => {
    // 모달 및 관련 요소 초기화
    inviteModal = document.getElementById("groupInviteModal");
    const closeBtn = document.getElementById("closeGroupInviteModal");
    const searchInput = document.getElementById("inviteSearchInput");
    const resultsContainer = document.getElementById("inviteResults");
    const sendInviteBtn = document.getElementById("sendInviteBtn");

    // 모달 닫기 버튼 클릭 시 모달 숨김
    if (closeBtn && inviteModal) {
        closeBtn.addEventListener("click", () => {
            inviteModal.classList.add("hidden");
        });
    }

    // 검색 입력란: 엔터키 입력 및 값 변경 시 처리
    if (searchInput) {
        // 엔터키 입력 시 검색 실행
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                searchUsers(searchInput.value.trim());
            }
        });
        // 입력란 내용이 비어 있으면 결과 초기화
        searchInput.addEventListener("input", () => {
            if (searchInput.value.trim().length === 0) {
                resultsContainer.innerHTML = "";
                resultsContainer.removeAttribute("data-selected-user-id");
            }
        });
        // 돋보기 아이콘 클릭 시 검색 실행 (모바일 환경 대응)
        const searchIcon = document.getElementById("searchIcon");
        if (searchIcon) {
            searchIcon.addEventListener("click", () => {
                searchUsers(searchInput.value.trim());
            });
        }
    }

    // 초대 보내기 버튼 클릭 시 처리
    if (sendInviteBtn) {
        sendInviteBtn.addEventListener("click", () => {
            const selectedUserId = resultsContainer.getAttribute("data-selected-user-id");
            if (!selectedUserId) {
                alert("초대할 사용자를 선택해주세요.");
                return;
            }
            sendInvite(selectedUserId);
        });
    }

    // eventBus를 통해 모달 열기 처리
    eventBus.on("openGroupInviteModal", () => {
        if (inviteModal) {
            inviteModal.classList.remove("hidden");
        } else {
            console.error("groupInviteModal not found");
        }
    });
});

// 사용자 검색 함수
async function searchUsers(query) {
    if (!query) return;
    const groupId = store.getSelectedGroupId();
    try {
        const response = await fetch(
            `/api/users/search?query=${encodeURIComponent(query)}&groupId=${groupId}`,
            { headers: { "Accept": "application/json" } }
        );
        if (!response.ok) {
            throw new Error("사용자 검색 실패");
        }
        const users = await response.json();
        renderSearchResults(users);
    } catch (error) {
        console.error("Error searching users:", error);
    }
}

// 검색 결과 렌더링 함수
function renderSearchResults(users) {
    const resultsContainer = document.getElementById("inviteResults");
    resultsContainer.innerHTML = "";
    if (users.length === 0) {
        resultsContainer.innerHTML = "<p class='text-gray-500'>검색 결과가 없습니다.</p>";
        return;
    }
    users.forEach(user => {
        const resultItem = document.createElement("div");
        resultItem.className = "p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100";
        resultItem.textContent = `${user.nickname} (${user.emailAddress})`;
        resultItem.addEventListener("click", () => {
            resultsContainer.innerHTML = `<p class="p-2 text-blue-600">선택됨: ${user.nickname}</p>`;
            resultsContainer.setAttribute("data-selected-user-id", user.id);
        });
        resultsContainer.appendChild(resultItem);
    });
}

// 초대 요청 전송 함수
async function sendInvite(toUserId) {
    try {
        const groupId = store.getSelectedGroupId();
        const currentUserId = store.getState().currentUser.id;
        if (!groupId || !currentUserId) {
            alert("그룹 정보 또는 현재 사용자 정보가 없습니다.");
            return;
        }
        const requestBody = {
            groupId: groupId,
            fromUserId: currentUserId,
            toUserId: parseInt(toUserId)
        };
        const response = await fetch(`/api/user-invitations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
            // 응답 본문을 읽어서 에러 메시지를 throw 합니다.
            const errorText = await response.message;
            throw new Error(errorText);
        }
        const result = await response.json();
        alert("초대가 전송되었습니다.");
        if (inviteModal) {
            inviteModal.classList.add("hidden");
        }
        eventBus.emit("inviteSent", result);
    } catch (error) {
        alert("초대 전송 실패: " + error.message);
        console.error("Error sending invite:", error);
    }
}