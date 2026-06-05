// 헬퍼 함수 정의를 최상단으로 이동 (에러 유발 방지 및 코드 보호 순정 유지)
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

let startY = 0;

window.onload = function() {
    const lockScreen = document.getElementById('lock-screen');
    
    // 1. 터치 시작 지점 저장
    lockScreen.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    }, { passive: true });

    // 2. 터치 이동 중 브라우저 기본 스크롤 방지 (아이폰 튕김 방지)
    lockScreen.addEventListener('touchmove', (e) => {
        if (e.cancelable) e.preventDefault();
    }, { passive: false });

    // 3. 터치 끝났을 때 정밀 판정 (위로 50px 이상 스와이프 시 해제)
    lockScreen.addEventListener('touchend', (e) => {
        let endY = e.changedTouches[0].clientY;
        
        // startY가 endY보다 크면 '위쪽'으로 드래그한 것입니다.
        if (startY - endY > 50) {
            lockScreen.classList.add('slide-up');
            setTimeout(() => {
                lockScreen.classList.add('hidden');
                document.getElementById('home-screen').classList.remove('hidden');
            }, 500);
        }
    }, { passive: true });
};

// ... 아래의 배경음악 및 팝업 제어 로직은 그대로 유지하시면 됩니다 ...
