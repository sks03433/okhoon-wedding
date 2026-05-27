const lockScreen = document.getElementById('lock-screen');
const homeScreen = document.getElementById('home-screen');
const mapPage = document.getElementById('map-page');
const bgm = document.getElementById('bgm');
const musicBtn = document.getElementById('music-btn');
const musicIcon = document.getElementById('music-icon');

let startY = 0;
let endY = 0;
let isMusicPlaying = false;

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
    if (startY - endY > 50) {
        lockScreen.classList.add('slide-up');
        homeScreen.classList.remove('hidden');
        setTimeout(() => { lockScreen.classList.add('hidden'); }, 500);
    }
}

// 2. 배경음악 토글 함수 (수정됨)
function toggleMusic() {
    if (isMusicPlaying) {
        bgm.pause();
        isMusicPlaying = false;
        musicIcon.classList.remove('fa-beat'); // 흔들리는 효과 제거
        musicBtn.classList.remove('playing');
        musicIcon.className = 'fa-solid fa-music'; // 일반 음표 아이콘
    } else {
        bgm.play().then(() => {
            isMusicPlaying = true;
            musicIcon.classList.add('fa-beat'); // 재생 중일 때 콩닥콩닥 흔들림
            musicBtn.classList.add('playing');
        }).catch(err => {
            alert("음악 파일을 불러오는데 실패했습니다. 깃허브에 bgm.mp3가 있는지 확인해주세요!");
        });
    }
}

// 3. 오시는 길 제어
function openMap() { mapPage.classList.remove('hidden'); }
function closeMap() { mapPage.classList.add('hidden'); }

// 4. 주소 복사
function copyAddress() {
    const address = "경기 수원시 팔달구 중부대로 181";
    navigator.clipboard.writeText(address).then(() => {
        alert("주소가 복사되었습니다!");
    });
}
