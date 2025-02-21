import { eventBus } from './eventBus.js';
export const store = {
    state: {
        groups: []
    },
    setGroups(groups) {
        this.state.groups = groups;
        eventBus.emit('groupsUpdated', groups);
    },
    getGroups() {
        return this.state.groups;
    }
};