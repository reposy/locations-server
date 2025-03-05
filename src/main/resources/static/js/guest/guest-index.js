import { eventBus } from './guest-eventBus.js';
import { store } from './guest-store.js';

document.addEventListener("DOMContentLoaded", () => {
    // "navigate" 이벤트 수신하여 main-content에 콘텐츠 로드
    eventBus.on("navigate", (url) => {
        loadContent(url);
    });

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
        // 토큰 소비 API 호출
        consumeToken(token);
    } else {
        alert("토큰이 존재하지 않습니다.");
        window.location.href = "/users/signin";
    }
});

// 토큰 소비 API 호출 함수
async function consumeToken(token) {
    store.setState({token})
    try {
        const response = await fetch(`/api/guest/group-invitations/consume?token=${token}`, {
            headers: { "X-Requested-With": "XMLHttpRequest" }
        });
        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.error || "그룹 참가에 실패했습니다.");
            // 실패 시 로그인 페이지로 리다이렉트
            window.location.href = "/users/signin";
            return;
        }
        const data = await response.json();
        // 그룹 입장 성공: store에 그룹 ID 저장 후, guest-group-detail 페이지로 이동
        store.setState({ groupId: data.groupId });
        store.setState({ guestId: data.guestId });
        store.setState({ guestNickname: data.guestNickname })
        eventBus.emit("navigate", `/guest/guest-group-detail`);
    } catch (e) {
        console.error("Error consuming token:", e);
        alert("토큰 소비 중 오류가 발생했습니다.");
        window.location.href = "/users/signin";
    }
}

// 기존 콘텐츠 로드 함수
async function loadContent(url) {
    try {
        const response = await fetch(url, {
            headers: { "X-Requested-With": "XMLHttpRequest" }
        });
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const html = await response.text();
        const mainContent = document.getElementById("main-content");
        mainContent.innerHTML = html;

        // main-content 내부의 data-page 속성을 가진 첫 번째 요소를 찾음
        const containerWithPage = mainContent.querySelector("[data-page]");
        const pageType = containerWithPage ? containerWithPage.getAttribute("data-page") : null;

        eventBus.emit("contentLoaded", { url, pageType });
    } catch (error) {
        console.error("Error loading content:", error);
    }
}