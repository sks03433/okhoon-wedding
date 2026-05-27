const lockScreen = document.getElementById('lock-screen');
const homeScreen = document.getElementById('home-screen');
const mapPage = document.getElementById('map-page');
let startY = 0;
let endY = 0;

// 1. 잠금화면 스와이프 기능
lockScreen.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; });
lockScreen.addEventListener('touchend', (e) => {
    endY = e.changedTouches[0].clientY;
    handleSwipe();
});

lockScreen.addEventListener('mousedown', (e) => { startY = e.clientY; });
lockScreen.addEventListener('mouseup', (e) => {
    endY = e.clientY;
    handleSwipe();
});

function handleSwipe() {
    // 위로 50픽셀 이상 올렸을 때 작동
    if (startY - endY > 50) {
        lockScreen.classList.add('slide-up');
        homeScreen.classList.remove('hidden');
        
        // [수정 핵심] 애니메이션이 끝나면 잠금화면을 완전히 없애서 터치를 방해하지 않도록 함
        setTimeout(() => {
            lockScreen.classList.add('hidden'); 
        }, 500);
    }
}

// 2. 오시는 길 창 열고 닫기 함수
function openMap() {
    mapPage.classList.remove('hidden');
}

function closeMap() {
    mapPage.classList.add('hidden');
}

// 3. 주소 복사 기능
function copyAddress() {
    const address = "경기 수원시 팔달구 중부대로 181";
    navigator.clipboard.writeText(address).then(() => {
        alert("주소가 복사되었습니다! 원하시는 네비게이션 앱에 붙여넣으세요.");
    }).catch(err => {
        alert("복사 실패했습니다. 직접 주소를 선택해 복사해주세요.");
    });
}