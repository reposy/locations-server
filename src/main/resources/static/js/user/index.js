document.addEventListener("DOMContentLoaded", () => {
    // 기본 콘텐츠 로드: /group-list 엔드포인트에서 프래그먼트 HTML을 가져와 삽입
    loadContent("/group-list");

    // 내비게이션 링크에 이벤트 리스너 등록 (예시)
    const navLinks = document.querySelectorAll("a.nav-link");
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const url = link.getAttribute("href");
            loadContent(url);
        });
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
        })
        .catch(error => {
            console.error("Error loading content:", error);
        });
}