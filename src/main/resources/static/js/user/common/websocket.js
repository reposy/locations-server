// 파일 경로: /js/user/common/websocket.js

import { store } from '../store.js';
import { eventBus } from '../eventBus.js';

// WebSocket 연결 객체 (Stomp 클라이언트)
let stompClient = null;

/**
 * WebSocket 초기화 함수
 * 이미 연결되어 있다면 기존 연결을 재사용합니다.
 */
export async function initWebSocket() {
    if (stompClient && stompClient.connected) {
        console.log("WebSocket 이미 연결됨");
        return stompClient;
    }
    return new Promise((resolve, reject) => {
        const socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);
        // 디버그 로그 끄기 (원하면)
        stompClient.debug = () => {};
        stompClient.connect({}, (frame) => {
            console.log("WebSocket 연결 성공:", frame);
            store.setStompClient(stompClient);
            eventBus.emit("websocketConnected", frame);
            resolve(stompClient);
        }, (error) => {
            console.error("WebSocket 연결 에러:", error);
            reject(error);
        });
    });
}

/**
 * WebSocket 연결 해제 함수
 */
export function disconnectWebSocket() {
    if (stompClient && stompClient.connected) {
        stompClient.disconnect(() => {
            console.log("WebSocket 연결 해제됨");
            stompClient = null;
            store.setStompClient(null);
            eventBus.emit("websocketDisconnected");
        });
    }
}

/**
 * 특정 그룹 토픽 구독 함수
 * @param {number} groupId - 구독할 그룹 ID
 * @param {Function} callback - 메시지 수신 시 실행할 콜백 함수
 */
export function subscribeToGroupTopic(groupId, callback) {
    if (!stompClient || !stompClient.connected) {
        console.error("WebSocket이 연결되어 있지 않습니다.");
        return;
    }
    const destination = `/topic/group.location.${groupId}`;
    const subscription = stompClient.subscribe(destination, (message) => {
        const payload = JSON.parse(message.body);
        callback(payload);
    });
    return subscription;
}

/**
 * 위치 업데이트 메시지를 서버로 전송하는 함수
 * @param {Object} locationUpdate - { userId, latitude, longitude, ... }
 */
export function sendLocationUpdate(locationUpdate) {
    if (!stompClient || !stompClient.connected) {
        console.error("WebSocket이 연결되어 있지 않습니다.");
        return;
    }
    stompClient.send("/app/group/location.update", {}, JSON.stringify(locationUpdate));
}