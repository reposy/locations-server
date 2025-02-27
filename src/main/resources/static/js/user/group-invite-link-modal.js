import { eventBus } from './eventBus.js';
import { store } from "./store.js";

document.addEventListener("DOMContentLoaded", () => {
    const inviteLinkModal = document.getElementById("groupInviteLinkModal");
    const closeBtn = document.getElementById("closeGroupInviteLinkModal");
    const inviteLinkInput = document.getElementById("inviteLinkInput");
    const copyBtn = document.getElementById("copyInviteLinkBtn");
    const refreshBtn = document.getElementById("refreshInviteLinkBtn");

    // 모달 닫기 (닫기 버튼)
    if (closeBtn && inviteLinkModal) {
        closeBtn.addEventListener("click", () => {
            inviteLinkModal.classList.add("hidden");
        });
    } else {
        console.error("groupInviteLinkModal 또는 닫기 버튼을 찾을 수 없습니다.");
    }

    // 모달 배경 클릭 시 닫힘
    if (inviteLinkModal) {
        inviteLinkModal.addEventListener("click", (e) => {
            if (e.target === inviteLinkModal) {  // 모달 배경 클릭 시
                inviteLinkModal.classList.add("hidden");
            }
        });
    }

    // 초대 링크 복사 버튼 (클릭 시 복사 후 alert)
    if (copyBtn && inviteLinkInput) {
        copyBtn.addEventListener("click", () => {
            inviteLinkInput.select();
            document.execCommand("copy");
            alert("초대 링크가 복사되었습니다.");
        });
    }

    // 초대 링크 새로 생성 버튼
    if (refreshBtn) {
        refreshBtn.addEventListener("click", async () => {
            await generateInviteLink();
        });
    }

    // 모달 열기 이벤트 수신: 모달이 열리면 초대 링크를 생성하고 자동 복사 후 alert 표시
    eventBus.on("openGroupInviteLinkModal", async () => {
        await generateInviteLink();
        if (inviteLinkModal) {
            inviteLinkModal.classList.remove("hidden");
        } else {
            console.error("groupInviteLinkModal not found");
        }
    });
});

// 초대 링크 생성 API 호출 및 결과 처리
async function generateInviteLink() {
    try {
        const groupId = store.getState().selectedGroupId;
        const response = await fetch(`/api/groups/${groupId}/invitation-tokens`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
        if (!response.ok) {
            throw new Error("초대 링크 생성에 실패했습니다.");
        }
        const result = await response.json();

        const inviteLinkInput = document.getElementById("inviteLinkInput");
        if (inviteLinkInput) {
            inviteLinkInput.value = result.invitationLink;
            // Clipboard API를 사용하여 자동 복사
            navigator.clipboard.writeText(result.invitationLink)
                .then(() => {
                    alert("초대 링크가 복사되었습니다.");
                })
                .catch((err) => {
                    console.error("초대 링크 복사 실패:", err);
                    alert("초대 링크 복사 실패: " + err);
                });
        }
    } catch (error) {
        console.error("Error generating invitation link:", error);
        alert("초대 링크 생성 실패: " + error.message);
    }
}