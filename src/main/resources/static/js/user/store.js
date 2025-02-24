import { eventBus } from './eventBus.js';

export const store = {
    state: {
        groups: [],
        selectedGroupId: null,
        naverMap: null,    // 생성된 네이버 지도 인스턴스
        naver: null,       // 전역 naver 객체
        locationFormData: {},
        savedLocations: [],
        stompClient: null  // WebSocket(STOMP) 클라이언트
    },
    setGroups(groups) {
        this.state.groups = groups;
        eventBus.emit('groupsUpdated', groups);
    },
    getGroups() {
        return this.state.groups;
    },
    setSelectedGroupId(id) {
        this.state.selectedGroupId = id;
        eventBus.emit('selectedGroupChanged', id);
    },
    getSelectedGroupId() {
        return this.state.selectedGroupId;
    },
    setNaverMap(map) {
        this.state.naverMap = map;
        eventBus.emit('naverMapReady', map);
    },
    getNaverMap() {
        return this.state.naverMap;
    },
    setNaver(naverObj) {
        this.state.naver = naverObj;
    },
    getNaver() {
        return this.state.naver;
    },
    setStompClient(client) {
        this.state.stompClient = client;
    },
    getStompClient() {
        return this.state.stompClient;
    },
    setState(newState) {
        this.state = { ...this.state, ...newState };
        eventBus.emit('stateUpdated', this.state);
    },
    getState() {
        return this.state;
    }
};