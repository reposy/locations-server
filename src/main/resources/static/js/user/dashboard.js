document.addEventListener("DOMContentLoaded", () => {
    // 사이드 메뉴 토글
    const sideMenuToggle = document.getElementById("sideMenuToggle");
    const sideMenu = document.getElementById("sideMenu"); // index.html에 정의된 사이드 메뉴 요소

    if (sideMenuToggle && sideMenu) {
        sideMenuToggle.addEventListener("click", () => {
            // translate-x-full 클래스가 있으면 제거하고, 없으면 추가하여 사이드 메뉴 슬라이드 효과를 구현
            sideMenu.classList.toggle("translate-x-full");
        });
    }

    // 그룹 생성 버튼 이벤트 처리
    const createGroupBtn = document.getElementById("createGroupBtn");
    if (createGroupBtn) {
        createGroupBtn.addEventListener("click", () => {
            // 그룹 생성 페이지로 이동
            window.location.href = "/groups/new";
        });
    }

    // 추가적으로 그룹 카드 클릭 이벤트 등 필요한 이벤트를 여기에 정의할 수 있습니다.
    // 예를 들어, 그룹 목록의 각 카드에 대한 동적 이벤트를 적용하려면:
    const groupCards = document.querySelectorAll("#groupList > div");
    groupCards.forEach(card => {
        card.addEventListener("click", () => {
            // th:onclick이 이미 적용되어 있다면 이 코드는 불필요할 수 있음.
            // 필요한 추가 로직이 있다면 여기에 작성
        });
    });

    // store 및 eventBus 초기화 코드도 여기에 추가 가능 (예: import { store } from './store.js';)
});