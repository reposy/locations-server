document.addEventListener("DOMContentLoaded", function () {

    // 새 그룹 추가 버튼
    document.getElementById("addGroupBtn").addEventListener("click", function () {
        alert("새 Location Group을 추가합니다.");
    });

    // 공유 코드 입력 후 가입
    document.getElementById("joinGroupBtn").addEventListener("click", function () {
        const inviteCode = document.getElementById("inviteCode").value;
        if (!inviteCode) {
            alert("공유 코드를 입력해주세요.");
            return;
        }
        alert(`공유 코드 ${inviteCode}로 그룹에 가입합니다.`);
    });

    // 그룹 공유 링크 생성
    window.shareGroup = function (groupId) {
        alert(`그룹 ${groupId} 공유 링크 생성`);
    };
});