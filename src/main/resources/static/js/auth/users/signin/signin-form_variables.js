import {Input} from "/js/component/input.js";

export const signInFormInputs = {
    "username": new Input("username", "username", "아이디", true, true, true),
    "password": new Input("password", "password", "비밀번호", true, false, true), // 패스워드는 중복 검사 제외
}

export const signInFormInputValidationRules = {
    "username": {
        check: (v) => v.length >= 4 && v.length <= 20 && /^[a-zA-Z0-9]+$/.test(v),
        success: "유효한 아이디입니다.",
        error: "아이디는 4~20자이며, 영문과 숫자만 가능합니다."
    },
    "password": {
        check: (v) => v.length >= 8 && v.length <= 20 && /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/.test(v),
        success: "유효한 비밀번호입니다.",
        error: "비밀번호는 8~20자이며, 영문자, 숫자, 특수문자를 포함해야 합니다."
    },
};