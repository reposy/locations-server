export class Component {
    id
    constructor(id) {
        this.id = id;
    }

    getElement = () => document.getElementById(this.id);
}