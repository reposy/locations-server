class Store {
    constructor(initialState = {}) {
        this.state = initialState;
        this.listeners = [];
    }

    /**
     * 상태 변경 구독
     * @param {Function} listener - (state) => {}
     * @returns {Function} 구독 해제 함수
     */
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    /**
     * 상태 업데이트 (부분 병합)
     * @param {Object} newState
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.listeners.forEach((listener) => listener(this.state));
    }

    /**
     * 현재 상태 반환
     * @returns {Object}
     */
    getState() {
        return this.state;
    }
}

export const store = new Store({
    // 데이터만 저장합니다.
    selectedLocation: null, // 사용자가 지도에서 선택한 위치 데이터
    locationFormData: {     // 폼에 입력된 데이터
        markerColor: "#9BF6FF",
        markerType: "default",
        nickname: "",
        address: "",
    },
    savedLocations: [],     // 저장된 위치 목록
});