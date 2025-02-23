import { eventBus } from './eventBus.js';

document.addEventListener("DOMContentLoaded", () => {
    loadContent("/group-list");

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
});

function loadContent(url) {
    fetch(url, {
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.text();
        })
        .then(html => {
            document.getElementById("main-content").innerHTML = html;
            // 콘텐츠 내에 groupList 컨테이너가 있으면 "groupListRequested" 이벤트 발생
            if (document.getElementById("groupList")) {
                eventBus.emit("groupListRequested");
            }
            // 콘텐츠 내에 group-detail 관련 요소가 있으면 "groupDetailRequested" 이벤트 발생
            if (document.getElementById("groupName") && document.getElementById("pageTitle")) {
                eventBus.emit("groupDetailRequested");
            }
        })
        .catch(error => {
            console.error("Error loading content:", error);
        });
}

function initGroupListEvents() {
    console.log("initGroupListEvents 실행됨");
    // 그룹 목록과 관련된 추가 이벤트 바인딩을 이곳에서 처리합니다.
}