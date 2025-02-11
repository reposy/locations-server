const eventBus = {
    events: {},   // 이벤트 콜백 저장
    state: {},    // 최신 상태 저장 (이벤트 발생 이후에도 접근 가능)

    subscribe(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);

        // ✅ 이벤트가 이미 발생한 적 있다면, 즉시 실행
        if (this.state[event] !== undefined) {
            callback(this.state[event]);
        }
    },

    publish(event, data) {
        this.state[event] = data; // ✅ 최신 값 저장
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
};

export default eventBus;  // ✅ 객체 전체를 export