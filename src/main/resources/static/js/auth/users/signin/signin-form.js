import {signInFormInputs as inputs, signInFormInputValidationRules as inputValidationRules} from "./signin-form_variables.js";

document.addEventListener("DOMContentLoaded", function () {

    // 🔹 keyup 이벤트: 유효성 검사 실행
    for (const input of Object.values(inputs)) {
        document.getElementById(input.id).addEventListener("keyup", () => validateInput(input));
    }

    // 🔹 로그인 버튼 클릭 이벤트
    document.getElementById("signInBtn").addEventListener("click", signIn);
});

/**
 * ✅ 유효성 검사 함수
 */
function validateInput(input) {
    const messageElement = document.getElementById(input.messageId);
    const value = input.getValue().trim();

    if (!(input.id in inputValidationRules)) {
        updateMessage(messageElement, `정의되지 않은 입력입니다: ${input.id}`, false);
        return false;
    }

    const { check, success, error } = inputValidationRules[input.id];
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
 * ✅ 모든 입력 필드 유효성 검사 (로그인 버튼 클릭 시 실행)
 */
function checkValidateAllInputs() {
    for (const input of Object.values(inputs)) {
        if (!validateInput(input)) {
            alert(inputValidationRules[input.id].error);
            console.log(`${input.korName} 유효성 검사 실패`);
            return false;
        }
    }
    return true;
}

/**
 * ✅ 로그인 요청 함수
 */
async function signIn() {
    // 🔹 유효성 검사
    if (!checkValidateAllInputs()) {
        console.log("로그인 실패: 유효성 검사 실패");
        return;
    }

    const loginData = Object.fromEntries(
        Object.values(inputs).map(input => [input.id, input.getValue().trim()])
    );

    try {
        const response = await fetch("/api/auth/users/signin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });

        if (response.ok) {
            window.location.href = "/"; // 로그인 성공 후 메인 페이지로 이동
        } else {
            const errorData = await response.json();

            // 🔹 서버 응답이 에러 메시지 형태일 경우 alert()로 표시
            if (errorData.errors) {
                alert(Object.values(errorData.errors).join("\n"));
            } else {
                alert(errorData?.error || "로그인에 실패했습니다.");
            }
        }
    } catch (error) {
        console.error("로그인 실패:", error);
        alert("네트워크 오류로 로그인에 실패했습니다.");
    }
}