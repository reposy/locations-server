import { eventBus } from './eventBus.js';
import { initGroupDetail } from './group-detail.js';

document.addEventListener("DOMContentLoaded", () => {
    loadContent("/group-list");

    // 내비게이션 링크 이벤트 (예시)
    document.querySelectorAll("a.nav-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const url = link.getAttribute("href");
            loadContent(url);
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
            // 콘텐츠 내에 groupList 컨테이너가 있으면 초기화 처리
            if (document.getElementById("groupList")) {
                initGroupListEvents();
            }
            // 콘텐츠 내에 group-detail 관련 요소가 있으면 initGroupDetail() 호출
            if (document.getElementById("groupName") && document.getElementById("pageTitle")) {
                initGroupDetail();
            }
        })
        .catch(error => {
            console.error("Error loading content:", error);
        });
}

function initGroupListEvents() {
    console.log("initGroupListEvents 실행됨");
    // 그룹 목록 이벤트 초기화 코드 (필요 시 추가)
}