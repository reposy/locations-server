import { eventBus } from '../eventBus.js';

document.addEventListener("DOMContentLoaded", () => {
    const btnGroupList = document.getElementById("btnGroupList");
    const btnProfile = document.getElementById("btnProfile");
    const btnSettings = document.getElementById("btnSettings");

    if (btnGroupList) {
        btnGroupList.addEventListener("click", () => {
            eventBus.emit("navigate", "/group-list");
        });
    } else {
        console.error("btnGroupList not found");
    }

    if (btnProfile) {
        btnProfile.addEventListener("click", () => {
            eventBus.emit("navigate", "/profile");
        });
    } else {
        console.error("btnProfile not found");
    }

    if (btnSettings) {
        btnSettings.addEventListener("click", () => {
            eventBus.emit("navigate", "/settings");
        });
    } else {
        console.error("btnSettings not found");
    }
});