import { store } from './store.js';
import { eventBus } from './eventBus.js';

document.addEventListener("DOMContentLoaded", () => {

    eventBus.on("contentLoaded", (data) => {
        if (data && data.pageType === "group-list") {
            updateGroupListHeader();
            loadGroupList();
        }
    });

    eventBus.on('groupsUpdated', (groups) => {
        renderGroupList(groups);
        bindCreateGroupBtn();
    });

    eventBus.on('groupCreated', () => {
        loadGroupList();
    });

    eventBus.on('groupDeleted', () => {
        loadGroupList();
    });

    eventBus.on('groupUpdated', () => {
        loadGroupList();
    });

    // "groupListRequested" 이벤트가 발생하면 loadGroupList() 실행
    eventBus.on("groupListRequested", () => {
        console.log("groupListRequested 이벤트 수신");
        loadGroupList();
    });
});


function updateGroupListHeader() {
    const headerElem = document.querySelector("#userGroupsH1");
    const user = store.getState().currentUser
    if (headerElem && user && user.nickname) {
        headerElem.textContent = `${user.nickname}님 그룹`;
    }
}

async function loadGroupList() {
    console.log("loadGroupList 호출됨");
    try {
        const response = await fetch('/api/groups/my', {
            headers: { "Accept": "application/json" }
        });
        if (!response.ok) {
            throw new Error("Failed to fetch group list");
        }
        const groups = await response.json();
        console.log("API로부터 그룹 목록 수신", groups);
        store.setGroups(groups);
    } catch (error) {
        console.error("Error loading group list:", error);
    }
}

function renderGroupList(groups) {
    const groupListContainer = document.getElementById("groupList");
    if (!groupListContainer) {
        console.error("groupList 컨테이너를 찾을 수 없습니다.");
        return;
    }
    groupListContainer.innerHTML = '';
    groups.forEach(group => {
        const card = document.createElement("div");
        card.className = "group relative bg-white p-4 rounded shadow hover:shadow-lg cursor-pointer";

        // 그룹 카드 클릭 시, 선택된 그룹 ID를 store에 저장한 후 상세 페이지로 이동
        card.onclick = () => {
            store.setSelectedGroupId(group.id);
            eventBus.emit("navigate", `/groups/${group.id}`);
        };

        // 그룹 생성자 닉네임 표시 (방장)
        const createUserNickname = document.createElement("h2");
        createUserNickname.className = "text-xl font-semibold";
        createUserNickname.textContent = group.createUserNickname;
        card.appendChild(createUserNickname);

        // 그룹 이름
        const title = document.createElement("h2");
        title.className = "text-xl font-semibold";
        title.textContent = group.name;
        card.appendChild(title);

        // 멤버 수 표시
        const membersP = document.createElement("p");
        membersP.className = "text-gray-600";
        membersP.innerHTML = `Members: <span>${group.memberCount}</span>`;
        card.appendChild(membersP);

        // 최대 사용자 수 표시
        const maxUsersP = document.createElement("p");
        maxUsersP.className = "text-gray-600";
        maxUsersP.innerHTML = `Max Users: <span>${group.maxUsers}</span>`;
        card.appendChild(maxUsersP);

        // 현재 사용자 ID
        const currentUserId = store.getState().currentUser.id;

        // 그룹 생성자와 같다면 수정/삭제 버튼 추가
        if (group.createUserId === currentUserId) {
            // 삭제 버튼 (휴지통 아이콘)
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-red-200 text-red-700 px-2 py-1 rounded text-sm";
            deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7 4H4a1 1 0 100 2h1v10a2 2 0 002 2h6a2 2 0 002-2V6h1a1 1 0 100-2h-3l-.106-.447A1 1 0 0011 2H9zM8 6h4v10H8V6z" clip-rule="evenodd"/>
    </svg>`;
            deleteBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                if (confirm("정말 삭제하시겠습니까?")) {
                    fetch(`/api/groups/${group.id}`, {
                        method: "DELETE",
                        headers: { "Accept": "application/json" }
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error("그룹 삭제에 실패했습니다.");
                            }
                            return response.json();
                        })
                        .then(data => {
                            alert("그룹이 삭제되었습니다.");
                            eventBus.emit("groupDeleted", data);
                            console.log("그룹 삭제 성공:", data);
                        })
                        .catch(error => {
                            alert("그룹 삭제에 실패했습니다: " + error.message);
                            console.error("삭제 API 에러:", error);
                        });
                }
            });
            card.appendChild(deleteBtn);

            // 수정 버튼 (연필 아이콘)
            const updateBtn = document.createElement("button");
            updateBtn.className = "absolute top-2 right-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-blue-200 text-blue-700 px-2 py-1 rounded text-sm";
            updateBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M17.414 2.586a2 2 0 010 2.828l-1.829 1.83-2.828-2.828 1.83-1.829a2 2 0 012.827 0z"/>
      <path d="M3 13.5V17h3.5l8.414-8.414-3.5-3.5L3 13.5z"/>
    </svg>`;
            updateBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                openUpdateModal(group);
            });
            card.appendChild(updateBtn);
        } else {
            // 만약 현재 사용자가 그룹 소유자가 아니라면, "나가기" 버튼(아이콘) 추가
            const leaveBtn = document.createElement("button");
            leaveBtn.className = "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm";
            leaveBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2H7V9h2V7h2v2h2v2h-2v2z"/>
            </svg>`;
            leaveBtn.title = "그룹 나가기";
            leaveBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                if (confirm("정말 그룹에서 나가시겠습니까?")) {
                    fetch(`/api/groups/${group.id}/members/leave`, {
                        method: "POST",
                        headers: { "Accept": "application/json" }
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error("그룹 나가기 실패");
                            }
                            return response.json();
                        })
                        .then(data => {
                            alert("그룹에서 나갔습니다.");
                            eventBus.emit("groupUpdated", data);
                            console.log("그룹 나가기 성공:", data);
                        })
                        .catch(error => {
                            alert("그룹 나가기에 실패했습니다: " + error.message);
                            console.error("나가기 API 에러:", error);
                        });
                }
            });
            card.appendChild(leaveBtn);
        }
        groupListContainer.appendChild(card);
    });
}

function bindCreateGroupBtn() {
    const btn = document.getElementById("createGroupBtn");
    if (btn) {
        btn.addEventListener("click", () => {
            const modal = document.getElementById("createGroupModal");
            if (modal) {
                modal.classList.remove("hidden");
                console.log("모달 열림 (bindCreateGroupBtn)");
            } else {
                console.error("createGroupModal not found");
            }
        });
    } else {
        console.error("createGroupBtn not found");
    }
}

function openUpdateModal(group) {
    const updateModal = document.getElementById("updateGroupModal");
    if (!updateModal) {
        console.error("updateGroupModal 요소가 없습니다.");
        return;
    }
    updateModal.setAttribute("data-group-id", group.id);
    document.getElementById("updateGroupName").value = group.name;
    document.getElementById("updateMaxUsers").value = group.maxUsers;
    updateModal.classList.remove("hidden");
}

export { loadGroupList, renderGroupList, bindCreateGroupBtn, openUpdateModal };