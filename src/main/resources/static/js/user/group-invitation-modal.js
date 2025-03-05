// 파일 경로: /js/user/group-invitation-modal.js
import { eventBus } from './eventBus.js';
import { loadInvitations } from '../service/invitationService.js';

document.addEventListener("DOMContentLoaded", () => {
    const invitationModal = document.getElementById("groupInvitationModal");
    const closeBtn = document.getElementById("closeGroupInvitationModal");
    const invitationList = document.getElementById("invitationList");
    const bulkAcceptBtn = document.getElementById("bulkAcceptBtn");
    const bulkDeclineBtn = document.getElementById("bulkDeclineBtn");
    const selectAllCheckbox = document.getElementById("selectAllCheckbox");

    // 모달 열기 이벤트 수신 (eventBus를 통해)
    eventBus.on("openGroupInvitationModal", async () => {
        try {
            const invitations = await loadInvitations();
            renderInvitations(invitationList, invitations);
            // 초대 개수를 업데이트하는 이벤트 방출 (헤더에서 수신)
            eventBus.emit("inviteCountUpdated");
            if (invitationModal) {
                invitationModal.classList.remove("hidden");
            } else {
                console.error("groupInvitationModal not found");
            }
        } catch (error) {
            invitationList.innerHTML = `<p class="text-red-500">${error.message}</p>`;
        }
    });

    eventBus.on("inviteResponse", async () => {
        try {
            const invitations = await loadInvitations();
            renderInvitations(invitationList, invitations);
            eventBus.emit("inviteCountUpdated");
        } catch (error) {
            invitationList.innerHTML = `<p class="text-red-500">${error.message}</p>`;
        }
    });

    // 모달 닫기 버튼 클릭 시 모달 숨김
    if (closeBtn && invitationModal) {
        closeBtn.addEventListener("click", () => {
            invitationModal.classList.add("hidden");
        });
    } else {
        console.error("groupInvitationModal 또는 closeGroupInvitationModal 요소를 찾을 수 없습니다.");
    }

    // Bulk 버튼 이벤트 등록
    if (bulkAcceptBtn) {
        bulkAcceptBtn.addEventListener("click", async () => {
            const selectedIds = getSelectedInvitationIds();
            if (selectedIds.length === 0) {
                alert("선택된 초대가 없습니다.");
                return;
            }
            await respondToInvitations(selectedIds, true);
        });
    }
    if (bulkDeclineBtn) {
        bulkDeclineBtn.addEventListener("click", async () => {
            const selectedIds = getSelectedInvitationIds();
            if (selectedIds.length === 0) {
                alert("선택된 초대가 없습니다.");
                return;
            }
            await respondToInvitations(selectedIds, false);
        });
    }

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", (e) => {
            const isChecked = e.target.checked;
            const checkboxes = document.querySelectorAll(".invitation-checkbox");
            checkboxes.forEach((checkbox) => {
                checkbox.checked = isChecked;
            });
        });
    }
});

// 초대 목록을 HTML로 렌더링하는 함수
function renderInvitations(container, invitations) {
    container.innerHTML = "";
    if (invitations.length === 0) {
        container.innerHTML = "<p class='text-gray-500'>받은 초대가 없습니다.</p>";
        return;
    }
    invitations.forEach(invitation => {
        // 전체 컨테이너: flex로 한 줄에 배치
        const inviteItem = document.createElement("div");
        inviteItem.className = "p-3 border-b border-gray-200 flex items-center space-x-2 cursor-pointer";

        // 텍스트(초대 정보)
        const textSpan = document.createElement("span");
        // 너무 길 경우 줄임표(...) 처리
        textSpan.className = "truncate";
        textSpan.textContent = `${invitation.id}. ${invitation.fromUserNickname} 님이 '${invitation.groupName}' 그룹에 초대함`;

        // 체크박스
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "invitation-checkbox w-6 h-6";
        checkbox.value = invitation.id;
        // 체크박스 클릭 시 이벤트 버블링 막기
        checkbox.addEventListener("click", (e) => e.stopPropagation());

        // 수락 버튼
        const acceptBtn = document.createElement("button");
        acceptBtn.className = "bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 flex-shrink-0";
        acceptBtn.textContent = "수락";
        acceptBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (confirm("초대를 수락하시겠습니까?")) {
                respondToInvitation(invitation.id, true);
            }
        });

        // 거절 버튼
        const declineBtn = document.createElement("button");
        declineBtn.className = "bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 flex-shrink-0";
        declineBtn.textContent = "거절";
        declineBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (confirm("초대를 거절하시겠습니까?")) {
                respondToInvitation(invitation.id, false);
            }
        });

        // 아이템 전체를 클릭하면 체크박스 토글
        inviteItem.addEventListener("click", (e) => {
            // 버튼 또는 체크박스 자체를 클릭한 경우 제외
            if (!e.target.closest("button") && e.target.type !== "checkbox") {
                checkbox.checked = !checkbox.checked;
            }
        });

        // 한 줄에 순서대로 추가
        inviteItem.appendChild(textSpan);
        inviteItem.appendChild(checkbox);
        inviteItem.appendChild(acceptBtn);
        inviteItem.appendChild(declineBtn);

        container.appendChild(inviteItem);
    });
}

// 체크박스에서 선택된 초대 ID 배열을 반환하는 함수
function getSelectedInvitationIds() {
    const checkboxes = document.querySelectorAll(".invitation-checkbox");
    const selected = [];
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selected.push(checkbox.value);
        }
    });
    return selected;
}

async function respondToInvitation(invitationId, isAccepted, suppressAlert = false, suppressEvents = false) {
    try {
        const url = isAccepted
            ? `/api/user-invitations/${invitationId}/accept`
            : `/api/user-invitations/${invitationId}/decline`;
        const response = await fetch(url, {
            method: "PUT",
            headers: { "Accept": "application/json" }
        });
        if (!response.ok) {
            let errorMessage = "초대 응답 처리에 실패했습니다.";
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) { }
            throw new Error(errorMessage);
        }
        const result = await response.json();

        const messageHead = `그룹 ${result.groupName}(${result.fromUserNickname})`;
        let message = "";
        if (isAccepted) {
            message = result.status === "DUPLICATE_DECLIEND"
                ? `${messageHead} 이미 그룹에 속해있습니다.`
                : `${messageHead} 초대를 수락했습니다.`;
        } else {
            message = `${messageHead} 초대를 거절했습니다.`;
        }

        if (!suppressAlert) {
            alert(message);
        }
        if (!suppressEvents) {
            // 개별 응답 시 이벤트 emit
            eventBus.emit("inviteResponse");
            eventBus.emit("inviteCountUpdated");
            eventBus.emit("groupUpdated");
        }
        return message;
    } catch (error) {
        if (!suppressAlert) {
            alert("초대 응답 실패: " + error.message);
        }
        console.error("Error responding to invitation:", error);
        throw error;
    }
}

// 다중 초대에 대한 응답 처리: 선택된 초대들을 순차 처리 후, 단일 alert로 결과를 보여줌
async function respondToInvitations(invitationIds, isAccepted, suppressAlert = false) {
    const messages = [];
    // 각 초대에 대해 개별적으로 처리 (오류 발생 시 해당 초대의 에러 메시지를 누적)
    for (const id of invitationIds) {
        try {
            const msg = await respondToInvitation(id, isAccepted, true, true);
            messages.push(`${id}: ${msg}`);
        } catch (error) {
            messages.push(`${id} 실패: ${error.message}`);
        }
    }
    // 모든 초대 처리 후, 하나의 alert로 결과 메시지를 표시 (옵션)
    const combinedMessage = messages.join("\n");
    if (!suppressAlert) {
        alert(combinedMessage);
    }
    // 이벤트를 한 번만 emit
    eventBus.emit("inviteResponse");
    eventBus.emit("inviteCountUpdated");
    eventBus.emit("groupUpdated");

    return combinedMessage;
}