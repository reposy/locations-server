document.addEventListener("DOMContentLoaded", () => {
    const openBtn = document.getElementById("openSideMenu");
    const closeBtn = document.getElementById("closeSideMenu");
    const sideMenu = document.getElementById("sideMenu");

    if (openBtn && sideMenu) {
        openBtn.addEventListener("click", () => {
            sideMenu.classList.remove("translate-x-full");
        });
    }

    if (closeBtn && sideMenu) {
        closeBtn.addEventListener("click", () => {
            sideMenu.classList.add("translate-x-full");
        });
    }
});