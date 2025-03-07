// /js/user/profile/profile.js
import { store } from './store.js';
import { eventBus } from './eventBus.js';

document.addEventListener("DOMContentLoaded", () => {
    eventBus.on("contentLoaded", (data) => {
        if (data && data.pageType === "user-profile") {
            loadCurrentProfile();
            bindProfileEventListeners();
        }
    });
});

function bindProfileEventListeners() {
    document.getElementById("nicknameSaveBtn").addEventListener("click", async () => {
        await updateNickname();
    });

    document.getElementById("emailSaveBtn").addEventListener("click", async () => {
        await updateEmail();
    });

    document.getElementById("passwordSaveBtn").addEventListener("click", async () => {
        await updatePassword();
    });
}

/**
 * 현재 프로필 정보를 불러와서 입력 필드에 채워 넣음.
 */
async function loadCurrentProfile() {
    try {
        const response = await fetch("/api/users/me", {
            headers: { "Accept": "application/json" }
        });
        if (!response.ok) {
            throw new Error("프로필 정보를 불러오지 못했습니다.");
        }
        const profile = await response.json();
        document.getElementById("nickname").value = profile.nickname || "";
        document.getElementById("email").value = profile.emailAddress || "";
    } catch (error) {
        console.error("프로필 로딩 오류:", error);
    }
}

/**
 * 별명 수정 요청
 */
async function updateNickname() {
    const userId = store.getState().currentUser.id;
    const nickname = document.getElementById("nickname").value.trim();
    if (!nickname) {
        showMessage("nicknameMessage", "별명을 입력하세요.", false);
        return;
    }
    try {
        const response = await fetch("/api/users/profile/nickname", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, nickname })
        });
        if (response.ok) {
            const updatedUser = await response.json();
            showMessage("nicknameMessage", "별명이 성공적으로 변경되었습니다.", true);
            eventBus.emit("profileUpdated", updatedUser);
        } else {
            const errorData = await response.json();
            showMessage("nicknameMessage", errorData.error || "별명 변경에 실패했습니다.", false);
        }
    } catch (error) {
        console.error("별명 변경 오류:", error);
        showMessage("nicknameMessage", "네트워크 오류로 별명 변경에 실패했습니다.", false);
    }
}

/**
 * 이메일 수정 요청
 */
async function updateEmail() {
    const userId = store.getState().currentUser.id;
    const email = document.getElementById("email").value.trim();
    if (!email) {
        showMessage("emailMessage", "이메일을 입력하세요.", false);
        return;
    }
    try {
        const response = await fetch("/api/users/profile/email", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, email })
        });
        if (response.ok) {
            const updatedUser = await response.json();
            showMessage("emailMessage", "이메일이 성공적으로 변경되었습니다.", true);
            eventBus.emit("profileUpdated", updatedUser);
        } else {
            const errorData = await response.json();
            showMessage("emailMessage", errorData.error || "이메일 변경에 실패했습니다.", false);
        }
    } catch (error) {
        console.error("이메일 변경 오류:", error);
        showMessage("emailMessage", "네트워크 오류로 이메일 변경에 실패했습니다.", false);
    }
}

/**
 * 비밀번호 수정 요청
 */
async function updatePassword() {
    const userId = store.getState().currentUser.id;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;
    if (!password || !passwordConfirm) {
        showMessage("passwordMessage", "비밀번호와 확인을 모두 입력하세요.", false);
        return;
    }
    if (password !== passwordConfirm) {
        showMessage("passwordMessage", "비밀번호와 확인이 일치하지 않습니다.", false);
        return;
    }
    try {
        const response = await fetch("/api/users/profile/password", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, password })
        });
        if (response.ok) {
            const updatedUser = await response.json();
            showMessage("passwordMessage", "비밀번호가 성공적으로 변경되었습니다.", true);
            eventBus.emit("profileUpdated", updatedUser);
        } else {
            const errorData = await response.json();
            showMessage("passwordMessage", errorData.error || "비밀번호 변경에 실패했습니다.", false);
        }
    } catch (error) {
        console.error("비밀번호 변경 오류:", error);
        showMessage("passwordMessage", "네트워크 오류로 비밀번호 변경에 실패했습니다.", false);
    }
}

/**
 * 메시지 표시 함수
 */
function showMessage(elementId, message, isSuccess) {
    const msgElem = document.getElementById(elementId);
    msgElem.textContent = message;
    msgElem.classList.remove("hidden", "text-green-500", "text-red-500");
    msgElem.classList.add(isSuccess ? "text-green-500" : "text-red-500");
}