document.addEventListener("DOMContentLoaded", initHeader);

function initHeader() {

    // 메뉴 버튼: 오른쪽 사이드 바 열기
    document.getElementById("menuBtn").addEventListener("click", function () {
        document.getElementById("sidebar").classList.remove("translate-x-full");
    });
    // 사이드 바 닫기
    document.getElementById("closeSidebar").addEventListener("click", function () {
        document.getElementById("sidebar").classList.add("translate-x-full");
    });

    // 로그아웃
    document.getElementById("logoutBtn").addEventListener("click", async function () {
        try {
            const response = await fetch("/api/auth/users/signout", {method: "POST"});
            if (response.ok) {
                alert("로그아웃 되었습니다.");
                window.location.href = "/users/signin";
            } else {
                alert("로그아웃에 실패했습니다.");
            }
        } catch (error) {
            console.error("로그아웃 오류:", error);
            alert("네트워크 오류로 로그아웃에 실패했습니다.");
        }
    });
}