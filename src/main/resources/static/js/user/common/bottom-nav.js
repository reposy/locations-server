import { eventBus } from '../eventBus.js';

document.addEventListener("DOMContentLoaded", () => {
    const groupListBtn = document.getElementById("groupListBtn");
    const profileBtn = document.getElementById("profileBtn");
    const signOutBtn = document.getElementById("signOutBtn");

    if (groupListBtn) {
        groupListBtn.addEventListener("click", () => {
            eventBus.emit("navigate", "/group-list");
        });
    } else {
        console.error("groupListBtn not found");
    }

    if (profileBtn) {
        profileBtn.addEventListener("click", () => {
            eventBus.emit("navigate", "/user-profile");
        });
    } else {
        console.error("profileBtn not found");
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
});