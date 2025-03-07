import { eventBus } from './eventBus.js';
import { store } from "./store.js";

document.addEventListener("DOMContentLoaded", async () => {

    // 내비게이션 링크 이벤트 (예시)
    document.querySelectorAll("a.nav-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const url = link.getAttribute("href");
            eventBus.emit("navigate", url);
        });
    });

    eventBus.on("navigate", async (url) => {
        await loadCurrentUser();
        loadContent(url);
    });


    eventBus.emit("navigate", "/group-list");
});

async function loadCurrentUser() {
    try {
        const response = await fetch('/api/users/me', {
            headers: { "Accept": "application/json" }
        });
        if (!response.ok) {
            throw new Error("현재 사용자 정보를 불러오지 못했습니다.");
        }
        const user = await response.json();
        // store에 현재 사용자 ID를 저장합니다.
        store.setState({ currentUser: user });
        console.log("현재 사용자 정보:", user);
    } catch (error) {
        console.error("Error loading current user:", error);
    }
}

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

        // mainContent 내부에서 data-page 속성이 설정된 첫 번째 요소를 찾음
        const containerWithPage = mainContent.querySelector("[data-page]");
        const pageType = containerWithPage ? containerWithPage.getAttribute("data-page") : null;

        // "contentLoaded" 이벤트를 발생시켜 각 모듈에서 초기화 작업을 진행하도록 함
        eventBus.emit("contentLoaded", { pageType, url });
    } catch (error) {
        console.error("Error loading content:", error);
    }
}