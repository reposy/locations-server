// 파일 경로: /static/js/user/group-update-modal.js
import { eventBus } from './eventBus.js';

document.addEventListener("DOMContentLoaded", () => {
    console.log("group-update-modal.js loaded");

    const updateModal = document.getElementById("updateGroupModal");
    const closeBtn = document.getElementById("closeUpdateGroupModal");
    const submitBtn = document.getElementById("submitUpdateGroup");

    if (closeBtn && updateModal) {
        closeBtn.addEventListener("click", () => {
            updateModal.classList.add("hidden");
            console.log("수정 모달 닫힘");
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener("click", () => {
            console.log("수정하기 버튼 클릭됨");
            const groupNameInput = document.getElementById("updateGroupName");
            const maxUsersInput = document.getElementById("updateMaxUsers");

            const newName = groupNameInput.value.trim();
            const newMax = parseInt(maxUsersInput.value.trim());

            if (newName.length < 2 || newName.length > 20) {
                alert("그룹 이름은 최소 2글자, 최대 20글자여야 합니다.");
                return;
            }
            if (isNaN(newMax) || newMax < 2 || newMax > 10) {
                alert("최대 사용자 수는 2명 이상 10명 이하여야 합니다.");
                return;
            }

            // 그룹 ID는 updateModal의 data-group-id 속성에 저장되어 있다고 가정
            const groupId = updateModal.getAttribute("data-group-id");

            const updateGroupRequest = {
                newName: newName,
                newMax: newMax
            };

            console.log("수정 API 요청 전송:", updateGroupRequest);

            fetch(`/api/groups/${groupId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(updateGroupRequest)
            })
                .then(response => {
                    if (!response.ok) {
                        return response.text().then(text => { throw new Error(text) });
                    }
                    return response.json();
                })
                .then(data => {
                    alert("그룹이 수정되었습니다.");
                    updateModal.classList.add("hidden");
                    eventBus.emit("groupUpdated", data);
                    console.log("그룹 수정 성공:", data);
                })
                .catch(error => {
                    alert("그룹 수정에 실패했습니다: " + error.message);
                    console.error("API 에러:", error);
                });
        });
    }

    window.addEventListener("click", (event) => {
        if (updateModal && event.target === updateModal) {
            updateModal.classList.add("hidden");
            console.log("수정 모달 외부 클릭으로 닫힘");
        }
    });
});