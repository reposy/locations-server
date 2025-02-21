// 파일 경로: /static/js/user/group-list.js
import { store } from './store.js';
import { eventBus } from './eventBus.js';

document.addEventListener("DOMContentLoaded", () => {
    loadGroupList();

    eventBus.on('groupsUpdated', (groups) => {
        renderGroupList(groups);
    });

    eventBus.on('groupCreated', () => {
        loadGroupList();
    });
});

function loadGroupList() {
    console.log("loadGroupList 호출됨");
    fetch('/api/groups/my', {
        headers: {
            "Accept": "application/json"
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch group list");
            }
            return response.json();
        })
        .then(groups => {
            console.log("API로부터 그룹 목록 수신", groups);
            store.setGroups(groups);
        })
        .catch(error => {
            console.error("Error loading group list:", error);
        });
}

function renderGroupList(groups) {
    console.log("renderGroupList 호출됨", groups);
    const groupListContainer = document.getElementById("groupList");
    if (!groupListContainer) {
        console.error("groupList 컨테이너를 찾을 수 없습니다.");
        return;
    }
    groupListContainer.innerHTML = '';
    groups.forEach(group => {
        const card = document.createElement("div");
        card.className = "bg-white p-4 rounded shadow hover:shadow-lg cursor-pointer";
        card.onclick = () => {
            window.location.href = `/groups/${group.id}`;
        };

        const title = document.createElement("h2");
        title.className = "text-xl font-semibold";
        title.textContent = group.name;
        card.appendChild(title);

        const membersP = document.createElement("p");
        membersP.className = "text-gray-600";
        membersP.innerHTML = `Members: <span>${group.memberCount}</span>`;
        card.appendChild(membersP);

        const sharingP = document.createElement("p");
        sharingP.className = "text-gray-600";
        sharingP.innerHTML = `Location Sharing: <span>${group.isLocationSharing ? 'ON' : 'OFF'}</span>`;
        card.appendChild(sharingP);

        const mapDiv = document.createElement("div");
        mapDiv.className = "mt-2 h-40 bg-gray-200 rounded";
        mapDiv.id = `map-${group.id}`;
        card.appendChild(mapDiv);

        groupListContainer.appendChild(card);
    });
}