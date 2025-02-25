import { eventBus } from '../eventBus.js';

// Navigation 스택 (최근 방문한 URL들을 저장)
const navigationStack = [];

// 현재 화면 URL을 저장하는 변수 (초기 화면은 빈 문자열)
let currentUrl = '';

document.addEventListener("DOMContentLoaded", () => {
    const openBtn = document.getElementById("openSideMenu");
    const closeBtn = document.getElementById("closeSideMenu");
    const backButton = document.getElementById("backButton");
    const sideMenu = document.getElementById("sideMenu");
    const signOutBtn = document.getElementById("signOutBtn");
    const invitationsBtn = document.getElementById("invitationsBtn");


    if (openBtn && sideMenu) {
        openBtn.addEventListener("click", () => {
            sideMenu.classList.remove("translate-x-full");
        });
    }

    if (closeBtn && sideMenu) {
        closeBtn.addEventListener("click", () => {
            sideMenu.classList.add("translate-x-full");
        });
    }

    if (backButton) {
        backButton.addEventListener("click", () => {
            if (navigationStack.length > 0) {
                const previousUrl = navigationStack.pop();
                console.log("Back to:", previousUrl, "Stack:", navigationStack);
                // 이전 URL을 현재 URL로 설정 후 navigate 이벤트 발생
                currentUrl = previousUrl;
                eventBus.emit("navigate", previousUrl);
            } else {
                console.log("Navigation stack is empty.");
            }
        });
    }

    if (signOutBtn) {
        signOutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            fetch("/api/auth/users/signout", { method: "GET", headers: { "Accept": "application/json" } })
                .then(response => {
                    if (response.ok) { window.location.href = "/"; }
                    else { console.error("로그아웃 실패"); }
                })
                .catch(err => console.error("로그아웃 요청 실패", err));
        });
    } else { console.error("로그아웃 버튼을 찾을 수 없습니다."); }

    if (invitationsBtn) {
        invitationsBtn.addEventListener("click", (e) => {
            e.preventDefault();
            // 특정 버튼을 식별하기 위해 id를 이용해 이벤트를 발생시킵니다.
            eventBus.emit("openGroupInvitationModal", { id: "invitationsBtn" });
        });
    } else {
        console.error("초대 목록 버튼(invitationsBtn)을 찾을 수 없습니다.");
    }

    // navigate 이벤트를 감지하여 스택에 현재 URL을 저장한 후, 새로운 URL로 이동
    eventBus.on("navigate", (newUrl) => {
        // 새로운 URL과 현재 URL이 다르면 스택에 추가
        if (currentUrl && currentUrl !== newUrl) {
            navigationStack.push(currentUrl);
            console.log("Navigation Stack:", navigationStack);
        }
        console.log(navigationStack)
        // 현재 URL 갱신
        currentUrl = newUrl;
    });

});



