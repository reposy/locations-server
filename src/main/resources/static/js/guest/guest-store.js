export const store = {
    state: {
        groupId: null,
        guestId: null,
        guestNickname: null,
        currentUser: null,
        naverMap: null,
        naver: null,
        token: null
    },
    getState() {
        return this.state;
    },
    setState(newState) {
        this.state = { ...this.state, ...newState };
    },
    getSelectedGroupId() {
        return this.state.groupId;
    },
    setSelectedGroupId(groupId) {
        this.state.groupId = groupId;
    },
    getNaverMap() {
        return this.state.naverMap;
    },
    setNaverMap(map) {
        this.state.naverMap = map;
    },
    getNaver() {
        return this.state.naver;
    },
    setNaver(naver) {
        this.state.naver = naver;
    }
};