import {Input} from "/js/component/input.js";

export const signUpFormInputs = {
    "nickname": new Input("nickname", "nickname", "별명", true, true, true),
    "username": new Input("username", "username", "아이디", true, true, true),
    "password": new Input("password", "password", "비밀번호", true, false, true), // 패스워드는 중복 검사 제외
    "passwordConfirm": new Input("passwordConfirm", "password-confirm", "비밀번호 확인", true, false, false), // 패스워드 확인은 중복 검사 및 api 통신 시 제외
    "emailAddress": new Input("emailAddress", "email-address", "이메일", true, true, true)
}

export const signUpFormInputValidationRules = {
    "nickname": {
        check: (v) => v.length >= 3 && v.length <= 10 && /^[가-힣a-zA-Z0-9]+$/.test(v),
        success: "사용 가능한 별명입니다.",
        error: "별명은 3~10자이며, 한글(자음, 모음 단독 제외), 영문, 숫자만 가능합니다."
    },
    "username": {
        check: (v) => v.length >= 4 && v.length <= 20 && /^[a-zA-Z0-9]+$/.test(v),
        success: "사용 가능한 아이디입니다.",
        error: "아이디는 4~20자이며, 영문과 숫자만 가능합니다."
    },
    "emailAddress": {
        check: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        success: "사용 가능한 이메일입니다.",
        error: "올바른 이메일 형식이 아닙니다."
    },
    "password": {
        check: (v) => v.length >= 8 && v.length <= 20 && /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/.test(v),
        success: "사용 가능한 비밀번호입니다.",
        error: "비밀번호는 8~20자이며, 영문자, 숫자, 특수문자를 포함해야 합니다."
    },
    "passwordConfirm": {
        check: (v) => v === document.getElementById("password").value,
        success: "비밀번호가 일치합니다.",
        error: "비밀번호와 비밀번호 확인이 서로 다릅니다."
    }
};