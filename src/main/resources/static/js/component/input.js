import { Component } from "/js/component/component.js";

export class Input extends Component {
    kebabId;
    korName;
    isValidationTarget;
    isDuplicateCheckTarget;
    isApiParameter;
    prevValue;
    messageId;

    constructor(id, kebabId, korName, isValidationTarget, isDuplicateCheckTarget, isApiParameter) {
        super(id)
        this.kebabId = kebabId;
        this.korName = korName;
        this.isValidationTarget = isValidationTarget;
        this.isDuplicateCheckTarget = isDuplicateCheckTarget;
        this.isApiParameter = isApiParameter
        this.prevValue = "";
        this.messageId = `${id}-message` // default
    }

    getValue = () => this.getElement().value;
}