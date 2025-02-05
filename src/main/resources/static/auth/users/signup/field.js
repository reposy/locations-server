export class Field {
    id;
    kebabId;
    korName;
    isValidationTarget;
    isDuplicateCheckTarget;
    messageId;
    value;
    validateRegEx;

    constructor(id, kebabId, korName, isValidationTarget, validateRegEx, isDuplicateCheckTarget) {
        this.id = id;
        this.kebabId = kebabId;
        this.korName = korName;

        this.isValidationTarget = isValidationTarget;
        this.validateRegEx = validateRegEx

        this.isDuplicateCheckTarget = isDuplicateCheckTarget;

        this.messageId = `${id}-message`;
        this.value = "";
    }

    validateField() {
        
        return true
    }

}