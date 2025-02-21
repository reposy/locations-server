document.addEventListener("DOMContentLoaded", () => {
    loadContent("/group-list");

    // 내비게이션 링크 이벤트 (예시)
    const navLinks = document.querySelectorAll("a.nav-link");
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const url = link.getAttribute("href");
            loadContent(url);
        });
    });

    // 전역 이벤트 위임: 문서에서 createGroupBtn 클릭 시 모달 열기
    document.addEventListener("click", (event) => {
        const createBtn = event.target.closest("#createGroupBtn");
        if (createBtn) {
            const modal = document.getElementById("createGroupModal");
            if (modal) {
                modal.classList.remove("hidden");
                console.log("모달 열림 (index.js)");
            }
        }
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
            // 만약 로드한 URL이 /group-list 이라면, 그룹 목록 이벤트 초기화 함수 호출
            if (url === "/group-list") {
                initGroupListEvents();
            }
        })
        .catch(error => {
            console.error("Error loading content:", error);
        });
}

function initGroupListEvents() {
    console.log("initGroupListEvents 실행됨");
    // 동적으로 로드된 그룹 목록 내 개별 이벤트를 추가할 수 있습니다.
    // 예를 들어, 그룹 카드 클릭 이벤트를 따로 바인딩할 필요가 있으면 여기서 처리합니다.
    // 만약 이미 상위 이벤트 위임을 통해 처리되고 있다면 이 함수는 비워둘 수 있습니다.
}