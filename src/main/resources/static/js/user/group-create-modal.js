// 파일 경로: /static/js/user/group-create-modal.js
import { eventBus } from './eventBus.js';

document.addEventListener("DOMContentLoaded", () => {
    console.log("group-create-modal.js loaded");

    const createGroupModal = document.getElementById("createGroupModal");
    const closeBtn = document.getElementById("closeCreateGroupModal");
    const submitBtn = document.getElementById("submitCreateGroup");

    if (closeBtn && createGroupModal) {
        closeBtn.addEventListener("click", () => {
            createGroupModal.classList.add("hidden");
            console.log("모달 닫힘 (닫기 버튼)");
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener("click", () => {
            console.log("생성하기 버튼 클릭됨");
            const groupNameInput = document.getElementById("groupName");
            const maxUsersInput = document.getElementById("maxUsers");

            const groupName = groupNameInput.value.trim();
            const maxUsers = parseInt(maxUsersInput.value.trim());

            if (groupName.length < 2 || groupName.length > 20) {
                alert("그룹 이름은 최소 2글자, 최대 20글자여야 합니다.");
                return;
            }
            if (isNaN(maxUsers) || maxUsers < 1 || maxUsers > 10) {
                alert("최대 사용자 수는 1명 이상 10명 이하여야 합니다.");
                return;
            }

            const createGroupRequest = {
                name: groupName,
                maxUsers: maxUsers
            };

            console.log("API 요청 전송:", createGroupRequest);

            fetch("/api/groups", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(createGroupRequest)
            })
                .then(response => {
                    if (!response.ok) {
                        return response.text().then(text => { throw new Error(text) });
                    }
                    return response.json();
                })
                .then(data => {
                    alert("그룹이 생성되었습니다.");
                    createGroupModal.classList.add("hidden");
                    eventBus.emit("groupCreated", data);
                    console.log("그룹 생성 성공:", data);
                })
                .catch(error => {
                    alert("그룹 생성에 실패했습니다: " + error.message);
                    console.error("API 에러:", error);
                });
        });
    }

    window.addEventListener("click", (event) => {
        if (createGroupModal && event.target === createGroupModal) {
            createGroupModal.classList.add("hidden");
            console.log("모달 외부 클릭으로 닫힘");
        }
    });
});