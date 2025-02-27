document.addEventListener("DOMContentLoaded", () => {
    const closeSideMenuBtn = document.getElementById("guestCloseSideMenu");
    const sideMenu = document.getElementById("guestSideMenu");

    if (closeSideMenuBtn && sideMenu) {
        closeSideMenuBtn.addEventListener("click", () => {
            sideMenu.classList.add("translate-x-full");
        });
    } else {
        console.error("guestCloseSideMenu 또는 guestSideMenu 요소를 찾을 수 없습니다.");
    }
});