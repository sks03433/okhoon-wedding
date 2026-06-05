// 헬퍼 함수 정의를 최상단으로 이동 (에러 유발 방지 및 코드 보호 순정 유지)
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

let startY = 0;
let isUnlocked = false; // 중복 실행 방지 플래그

// 잠금 해제 실행 함수 (애니메이션 통합)
function 도어오픈() {
    if (isUnlocked) return;
    isUnlocked = true;

    const lockScreen = document.getElementById('lock-screen');
    lockScreen.classList.add('slide-up');
    
    setTimeout(() => {
        lockScreen.classList.add('hidden');
        document.getElementById('home-screen').classList.remove('hidden');
    }, 500);
}

// 화면을 그냥 터치/클릭했을 때
function unlockRequest() {
    도어오픈();
}

window.onload = function() {
    const lockScreen = document.getElementById('lock-screen');
    
    // 모바일 스와이프 정밀 감지
    lockScreen.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    }, { passive: true });

    lockScreen.addEventListener('touchmove', (e) => {
        if (e.cancelable) e.preventDefault();
    }, { passive: false });

    lockScreen.addEventListener('touchend', (e) => {
        let endY = e.changedTouches[0].clientY;
        // 위로 30px만 올려도 시원하게 열리도록 임계값 완화
        if (startY - endY > 30) {
            도어오픈();
        }
    }, { passive: true });
};

// ... 아래의 배경음악 및 팝업 제어 로직은 그대로 유지하시면 됩니다 ...
