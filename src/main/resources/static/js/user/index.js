import { eventBus } from './eventBus.js';

document.addEventListener("DOMContentLoaded", () => {

    // 내비게이션 링크 이벤트 (예시)
    document.querySelectorAll("a.nav-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const url = link.getAttribute("href");
            eventBus.emit("navigate", url);
        });
    });

    eventBus.on("navigate", (url) => {
        loadContent(url);
    });

    // 초기 화면은 그룹 목록으로 설정 (서버에서 group-list.html에 data-page="group-list"를 추가)
    eventBus.emit("navigate", "/group-list");
});

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

        // 만약 HTML에 data-page 속성이 있다면 사용
        const pageType = mainContent.getAttribute("data-page");
        // "contentLoaded" 이벤트를 발생시켜 각 모듈에서 처리하도록 함
        const event = new CustomEvent("contentLoaded", { detail: { pageType, url } });
        document.dispatchEvent(event);
    } catch (error) {
        console.error("Error loading content:", error);
    }
}