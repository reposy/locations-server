document.addEventListener("DOMContentLoaded", () => {
    const openSideMenuBtn = document.getElementById("openSideMenu");
    const closeSideMenuBtn = document.getElementById("closeSideMenu");
    const sideMenu = document.getElementById("sideMenu");
    const signOutBtn = document.getElementById("signOutBtn");

    if (openSideMenuBtn && sideMenu) {
        openSideMenuBtn.addEventListener("click", () => {
            sideMenu.classList.remove("translate-x-full");
        });
    }

    if (closeSideMenuBtn && sideMenu) {
        closeSideMenuBtn.addEventListener("click", () => {
            sideMenu.classList.add("translate-x-full");
        });
    }

    if (signOutBtn) {
        signOutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            fetch("/api/auth/users/signout", { method: "GET", headers: { "Accept": "application/json" } })
                .then(response => {
                    if (response.ok) { window.location.href = "/"; }
                    else { console.error("로그아웃 실패"); }
                })
                .catch(err => console.error("로그아웃 요청 실패", err));
        });
    } else { console.error("로그아웃 버튼을 찾을 수 없습니다."); }
});