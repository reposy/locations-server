import { store } from '../user/store.js';
import { eventBus } from '../user/eventBus.js';

let stompClient = null;

/**
 * WebSocket 초기화: 이미 연결되어 있으면 기존 연결 재사용
 */
export async function initWebSocket() {
    if (stompClient && stompClient.connected) {
        console.log("WebSocket 이미 연결됨");
        return stompClient;
    }
    return new Promise((resolve, reject) => {
        const socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);
        stompClient.debug = () => {}; // 디버그 로그 비활성화
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
 * WebSocket 연결 해제
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
 * 그룹 위치 업데이트 토픽 구독
 * @param {number} groupId - 그룹 ID
 * @param {Function} callback - 메시지 수신 콜백
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
 * 그룹 멤버 업데이트 토픽 구독
 * @param {number} groupId - 그룹 ID
 * @param {Function} callback - 메시지 수신 콜백
 */
export function subscribeToMemberUpdates(groupId, callback) {
    if (!stompClient || !stompClient.connected) {
        console.error("WebSocket이 연결되어 있지 않습니다.");
        return;
    }
    const destination = `/topic/group.members.${groupId}`;
    const subscription = stompClient.subscribe(destination, (message) => {
        const payload = JSON.parse(message.body);
        callback(payload);
    });
    return subscription;
}

/**
 * 위치 업데이트 메시지 서버 전송
 * @param {Object} locationUpdate - { userId, latitude, longitude, ... }
 */
export function sendLocationUpdate(locationUpdate) {
    if (!stompClient || !stompClient.connected) {
        console.error("WebSocket이 연결되어 있지 않습니다.");
        return;
    }
    stompClient.send("/app/group/location.update", {}, JSON.stringify(locationUpdate));
}