import {signUpFormInputs as inputs, signUpFormInputValidationRules as inputValidationRules} from "./signup-form_variables.js";

document.addEventListener("DOMContentLoaded", function () {

    for (const input of Object.values(inputs)) {
        document.getElementById(input.id).addEventListener("keyup", async (e) => {
            const newValue = e.target.value;

            if(newValue === input.prevValue)
                return;

            if (input.id === "password") // 비밀번호 입력 시 비밀번호 확인 keyup 이벤트 발생
                document.getElementById("passwordConfirm").dispatchEvent(new Event("keyup"));

            if (input.isValidationTarget && !validateInput(input, newValue)) {
                return;
            }

            if (input.isDuplicateCheckTarget)
                await checkInputDuplicate(input, newValue)
        });
    }

    // 회원가입 버튼 클릭 이벤트 등록
    document.getElementById("signUpBtn").addEventListener("click", signUp);
});


/**
 *  공통 중복 체크 함수
 */
async function checkInputDuplicate(input) {

    try {
        const response = await fetch(`/api/auth/users/signup/check-${input.kebabId}?${input.id}=${encodeURIComponent(input.getValue())}`);
        const isAvailable = response.status === 200;
        const message = isAvailable ? `사용 가능한 ${input.korName}입니다.`
                                           : `이미 사용 중인 ${input.korName}입니다.`;

        updateMessageToComponentId(input.messageId, message, isAvailable);
        return isAvailable;
    } catch (error) {
        console.error(`${input.korName} 중복 확인 실패:`, error);
        updateMessageToComponentId(input.messageId, "중복 확인에 실패했습니다.", false);
        return false;
    }
}

/**
 *  필드 유효성 검사 함수
 */
function validateInput(input, value) {

    if (!(input.id in inputValidationRules)) {
        updateMessageToComponentId(input.messageId, `정의되지 않은 입력입니다. :${input.id}`, false);
        return false;
    }

    const { check, success, error } = inputValidationRules[input.id];
    const isValid = check(value);
    updateMessageToComponentId(input.messageId, isValid ? success : error, isValid);

    return isValid;
}

/**
 *  메시지 업데이트 함수
 */
function updateMessageToComponentId(componentId, message, isValid) {
    const element = document.getElementById(componentId)
    element.textContent = message;
    element.classList.remove("hidden", "text-green-500", "text-red-500");
    element.classList.add(isValid ? "text-green-500" : "text-red-500");
}

/**
 *  모든 필드 유효성 검사 함수 (회원가입 버튼 클릭 시 실행)
 */
function checkValidateAllInputs() {
    const validateInputs = Object.values(inputs).filter(input => input.isValidationTarget)
    for (const input of validateInputs)
        if (!validateInput(input, input.getValue())) {
            const errorMessage = inputValidationRules[input.id].error
            alert(errorMessage)
            console.log(`${input.korName} 유효성 검사 실패`)
            return false
        }
    return true
}

/**
 * 모든 중복 필드 검사 대상 검사 실행
 */
async function checkDuplicateAllInputs() {

    const checkDuplicateInputs = Object.values(inputs).filter(input => input.isDuplicateCheckTarget)
    const checkResults = await Promise.all(
        checkDuplicateInputs.map(async (input) => {
            return await checkInputDuplicate(input);
    }));

    return checkResults.every(result => result === true);
}

/**
 *  회원가입 요청 함수
 */
async function signUp() {
    if (!checkValidateAllInputs()) {
        console.log("회원가입 실패: 유효성 검사 실패");
        return;
    }

    if (!await checkDuplicateAllInputs()) {
        console.log("회원가입 실패: 중복 검사 실패");
        return;
    }

    const userSignUpRequest = Object.fromEntries(
        Object.values(inputs)
            .filter(e => e.isApiParameter)
            .map(input => [input.id, input.getValue()])
    );

    try {
        const response = await fetch("/api/auth/users/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userSignUpRequest)
        });

        if (response.ok) {
            // 회원가입 성공 시 알림창 띄우기
            alert("회원가입이 완료되었습니다.");
            window.location.href = "/users/signin";
        } else {
            const errorData = await response.json();

            // 서버 응답이 에러 메시지 형태일 경우 처리
            if (errorData.errors) {
                // 여러 개의 에러 메시지를 '\n'으로 연결하여 출력
                const errorMessage = Object.values(errorData.errors).join("\n");
                alert(errorMessage);
            } else {
                alert(errorData?.error || "서버에서 오류가 발생했습니다.");
            }
        }
    } catch (error) {
        console.error("회원가입 실패:", error);
        alert("네트워크 오류로 회원가입에 실패했습니다.");
    }
}