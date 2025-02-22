import { eventBus } from './eventBus.js';

export const store = {
    state: {
        groups: [],
        selectedGroupId: null
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
    }
};