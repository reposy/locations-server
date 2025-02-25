import { eventBus } from './eventBus.js';
import { store } from './store.js';

// DOMContentLoaded 시 모달 관련 요소들을 초기화합니다.
document.addEventListener("DOMContentLoaded", () => {
    const inviteModal = document.getElementById("groupInvitationModal");
    const closeBtn = document.getElementById("closeGroupInvitationModal");

    // 모달 닫기 버튼 클릭 시 모달 숨김
    if (closeBtn && inviteModal) {
        closeBtn.addEventListener("click", () => {
            inviteModal.classList.add("hidden");
        });
    } else {
        console.error("groupInvitationModal 또는 closeGroupInvitationModal 요소를 찾을 수 없습니다.");
    }



    // 초대 모달 열기 이벤트 수신
    eventBus.on("openGroupInvitationModal", async (data) => {
        console.log("openGroupInvitationModal 이벤트 수신:", data);
        await loadInvitations()
        if (inviteModal) {
            inviteModal.classList.remove("hidden");
        } else {
            console.error("groupInviteModal을 찾을 수 없습니다.");
        }
    });
});

// 초대 목록을 서버에서 불러와 모달에 렌더링하는 함수
async function loadInvitations() {
    const invitationList = document.getElementById("invitationList");
    if (!invitationList) {
        console.error("invitationList 요소를 찾을 수 없습니다.");
        return;
    }
    invitationList.innerHTML = "<p class='text-gray-500'>로딩 중...</p>";

    try {
        const response = await fetch(`/api/user-invitations/received`, {
            headers: { "Accept": "application/json" }
        });
        if (!response.ok) {
            throw new Error("초대 목록을 불러오지 못했습니다.");
        }
        const invitations = await response.json();
        renderInvitations(invitationList, invitations);
    } catch (error) {
        console.error("Error loading invitations:", error);
        invitationList.innerHTML = `<p class="text-red-500">${error.message}</p>`;
    }
}

// 초대 목록을 HTML로 렌더링하는 함수
function renderInvitations(container, invitations) {
    container.innerHTML = "";
    if (invitations.length === 0) {
        container.innerHTML = "<p class='text-gray-500'>받은 초대가 없습니다.</p>";
        return;
    }
    invitations.forEach(invitation => {
        const inviteItem = document.createElement("div");
        inviteItem.className = "p-3 border-b border-gray-200";

        // 초대 정보 표시 (예: 보낸 사람 닉네임, 초대 상태 등)
        inviteItem.innerHTML = `
            <p class="font-semibold">${invitation.fromUserNickname} 님이 초대함</p>
            <p class="text-sm text-gray-600">초대 상태: ${invitation.status}</p>
        `;

        // 수락 및 거절 버튼
        const btnContainer = document.createElement("div");
        btnContainer.className = "mt-2 flex space-x-2";

        const acceptBtn = document.createElement("button");
        acceptBtn.className = "bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600";
        acceptBtn.textContent = "수락";
        acceptBtn.addEventListener("click", () => {
            respondToInvitation(invitation.id, true);
        });

        const declineBtn = document.createElement("button");
        declineBtn.className = "bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600";
        declineBtn.textContent = "거절";
        declineBtn.addEventListener("click", () => {
            respondToInvitation(invitation.id, false);
        });

        btnContainer.appendChild(acceptBtn);
        btnContainer.appendChild(declineBtn);
        inviteItem.appendChild(btnContainer);

        container.appendChild(inviteItem);
    });
}

// 초대에 대한 응답(수락/거절)을 서버에 전송하는 함수
async function respondToInvitation(invitationId, isAccepted) {
    try {
        const url = isAccepted
            ? `/api/user-invitations/${invitationId}/accept`
            : `/api/user-invitations/${invitationId}/decline`;
        const response = await fetch(url, {
            method: "PUT",
            headers: { "Accept": "application/json" }
        });
        if (!response.ok) {
            throw new Error("초대 응답 처리에 실패했습니다.");
        }
        const result = await response.json();

        alert(`그룹 ${result.groupName}(${result.fromUserNickname})` + (isAccepted ? "초대를 수락했습니다." : "초대를 거절했습니다."));
        await loadInvitations()
        eventBus.emit("groupUpdated")

    } catch (error) {
        alert("초대 응답 실패: " + error.message);
        console.error("Error responding to invitation:", error);
    }
}