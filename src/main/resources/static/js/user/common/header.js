import { eventBus } from '../eventBus.js';
import { loadInvitations } from '../../service/invitationService.js';
import {store} from "../store.js";

const navigationStack = [];
let currentUrl = '';

document.addEventListener("DOMContentLoaded", async () => {
    const openSideMenuBtn = document.getElementById("openSideMenu");
    const closeSideMenuBtn = document.getElementById("closeSideMenu");
    const sideMenu = document.getElementById("sideMenu");
    const backButton = document.getElementById("backButton");
    const openInvitationsBtn = document.getElementById("openInvitationsBtn");
    const inviteBadgeEl = document.getElementById("inviteBadge");

    // 사이드 메뉴 토글
    if (openSideMenuBtn && sideMenu) {
        openSideMenuBtn.addEventListener("click", () => {
            sideMenu.classList.remove("translate-x-full");
        });
    }
    if (closeSideMenuBtn && sideMenu) {
        closeSideMenuBtn.addEventListener("click", () => {
            sideMenu.classList.add("translate-x-full");
        });
    }

    // 뒤로가기 버튼: 스택에 저장된 URL로 이동
    if (backButton) {
        backButton.addEventListener("click", () => {
            if (navigationStack.length > 0) {
                const previousUrl = navigationStack.pop();
                console.log("Back to:", previousUrl, "Stack:", navigationStack);
                currentUrl = previousUrl;
                eventBus.emit("navigate", previousUrl);
            } else {
                console.log("Navigation stack is empty.");
            }
        });
    }

    // 초대 목록 버튼 클릭 시 모달 열기
    if (openInvitationsBtn) {
        openInvitationsBtn.addEventListener("click", () => {
            eventBus.emit("openGroupInvitationModal");
        });
    } else {
        console.error("invitationsBtn not found");
    }

    // 초대 갯수 업데이트 이벤트 수신
    eventBus.on("inviteCountUpdated", () => {
        const count = store.getState().invitations.length || 0
        if (!inviteBadgeEl || !openInvitationsBtn) return;

        if (count > 0) {
            inviteBadgeEl.classList.remove("hidden");
            inviteBadgeEl.textContent = count > 99 ? "99+" : count.toString();

            // // 강조 효과(예: 빨간 테두리)를 주고 싶다면
            // openInvitationsBtn.classList.add("ring-2", "ring-red-500");
        } else {
            inviteBadgeEl.classList.add("hidden");
            openInvitationsBtn.classList.remove("ring-2", "ring-red-500");
        }
    });

    // navigate 이벤트 발생 시: 현재 URL을 스택에 저장 후 갱신
    eventBus.on("navigate", (newUrl) => {
        if (currentUrl && currentUrl !== newUrl) {
            navigationStack.push(currentUrl);
            console.log("Navigation Stack:", navigationStack);
        }
        currentUrl = newUrl;
    });

    // 초기 초대 목록 로드 및 초대 개수 업데이트
    try {
        await loadInvitations();
        eventBus.emit("inviteCountUpdated");
    } catch (error) {
        console.error("Failed to load invitation count:", error);
    }
});