document.addEventListener("DOMContentLoaded", () => {
    const openSideMenuBtn = document.getElementById("guestOpenSideMenu");
    const sideMenu = document.getElementById("guestSideMenu");
    const backButton = document.getElementById("guestBackButton");

    // 사이드 메뉴 열기
    if (openSideMenuBtn && sideMenu) {
        openSideMenuBtn.addEventListener("click", () => {
            sideMenu.classList.remove("translate-x-full");
        });
    }

    // 뒤로가기 버튼 클릭 시 이전 페이지로 이동 (예: window.history.back())
    if (backButton) {
        backButton.addEventListener("click", () => {
            window.history.back();
        });
    }

    // 추가로 이벤트 버스를 활용하여 네비게이션 관련 로직을 추가할 수도 있습니다.
});