import {Field} from "./field";
let fields = []

document.addEventListener("DOMContentLoaded", function () {

    fields = [
        new Field("nickname", "nickname", "별명", true, true),
        new Field("username", "username", "아이디",  true, true),
        new Field("password", "password", "비밀번호", true, false), // 패스워드는 중복 검사 제외
        new Field("emailAddress", "email-address", "이메일", true, true)
    ];

    for (const field in fields) {
        document.getElementById(field.id).addEventListener("blur", async (e) => {
            const newValue = e.target.value;

            if(newValue === field.value)
                return;

            if (field.isValidationTarget && !validateField(field.id, newValue))
                return;

            if (field.isDuplicateCheckTarget)
                await checkFieldDuplicate(field, newValue)
        });
    }

    // 회원가입 버튼 클릭 이벤트 등록
    document.getElementById("signUpBtn").addEventListener("click", signUp);
});

/**
 * ✅ 공통 중복 체크 함수
 */
async function checkFieldDuplicate(field, value) {
    if (!value) return true;

    try {
        const response = await fetch(`/api/auth/users/sign-up/check-${field.kebabId}?${field.id}=${encodeURIComponent(value)}`);
        const isAvailable = response.status === 200;

        updateMessage(document.getElementById(field.messageId),
            isAvailable ? `사용 가능한 ${field.korName}입니다.`
                : `이미 사용 중인 ${field.korName}입니다.`,
            isAvailable);
        return isAvailable;
    } catch (error) {
        console.error(`${getFieldKorLabel(field)} 중복 확인 실패:`, error);
        updateMessage(document.getElementById(`${field}-message`), "중복 확인에 실패했습니다.", false);
        return false;
    }
}

/**
 * ✅ 필드 유효성 검사 함수 (형식 검사)
 */
function validateField(field, value) {
    value = value || "";

    const validationRules = {
        "nickname": {
            check: (v) => v.length >= 3 && v.length <= 10 && /^[가-힣a-zA-Z0-9]+$/.test(v),
            success: "사용 가능한 별명입니다.",
            error: "별명은 3~10자이며, 한글(자음, 모음 단독 제외), 영문, 숫자만 가능합니다."
        },
        "username": {
            check: (v) => v.length >= 4 && v.length <= 20 && /^[a-zA-Z0-9]+$/.test(v),
            success: "사용 가능한 아이디입니다.",
            error: "아이디는 4~20자이며 영문과 숫자만 가능합니다."
        },
        "emailAddress": {
            check: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
            success: "사용 가능한 이메일입니다.",
            error: "올바른 이메일 형식이 아닙니다."
        },
        "password": {
            check: (v) => v.length >= 8 && v.length <= 20 && /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/.test(v),
            success: "사용 가능한 비밀번호입니다.",
            error: "비밀번호는 8~20자여야 하며 영문자, 숫자, 특수문자를 포함해야 합니다."
        }
    };

    const messageElement = document.getElementById(`${field}-message`);
    if (!(field in validationRules)) {
        updateMessage(messageElement, `정의되지 않은 필드명입니다. :${field}`, false);
        return false;
    }

    const { check, success, error } = validationRules[field];
    const isValid = check(value);
    updateMessage(messageElement, isValid ? success : error, isValid);

    return isValid;
}

/**
 * ✅ 메시지 업데이트 함수
 */
function updateMessage(element, message, isValid) {
    element.textContent = message;
    element.classList.remove("hidden", "text-green-500", "text-red-500");
    element.classList.add(isValid ? "text-green-500" : "text-red-500");
}

/**
 * ✅ 필드명을 한글로 변환하는 함수
 */
function getFieldKorLabel(field) {
    const labels = {
        "username": "아이디",
        "nickname": "별명",
        "emailAddress": "이메일"
    };
    return labels[field] ?? field;
}

/**
 *  모든 필드 유효성 검사 함수 (회원가입 버튼 클릭 시 실행)
 */
function checkValidateAllFields() {
    const fields = ["username", "nickname", "emailAddress", "password"];

    for (const field of fields) {
        const value = document.getElementById(field).value || "";
        if (!validateField(field, value))
            return false
    }

    return true
}

/**
 * 모든 중복 필드 검사 대상 검사 실행
 */
async function checkDuplicateAllFields() {
    const duplicateFields = ["username", "nickname", "emailAddress"];
    const checkResults = await Promise.all(
        duplicateFields.map(async (field) => {
            const value = document.getElementById(field).value || "";
            return await checkFieldDuplicate(duplicateFields[field], field, value);
    }));

    return checkResults.every(result => result === true);
}


/**
 *  회원가입 요청 함수
 */
async function signUp() {
    if(!checkValidateAllFields()) {
        console.log("회원가입 실패: 유효성 검사 실패")
        return
    }
    if(!await checkDuplicateAllFields()) {
        console.log("회원가입 실패: 중복 검사 실패")
        return
    }

    const userData = {
        username: document.getElementById("username").value,
        nickname: document.getElementById("nickname").value,
        emailAddress: document.getElementById("emailAddress").value,
        password: document.getElementById("password").value
    };

    try {
        const response = await fetch("/api/auth/users/sign-up", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            updateMessage(document.getElementById("success-message"), "회원가입이 완료되었습니다.", true);
        } else {
            const errorData = await response.json();
            const errorMessage = errorData?.error || "서버에서 오류가 발생했습니다.";
            updateMessage(document.getElementById("error-message"), errorMessage, false);
        }
    } catch (error) {
        console.error("회원가입 실패:", error);
        updateMessage(document.getElementById("error-message"), "네트워크 오류로 회원가입에 실패했습니다.", false);
    }
}