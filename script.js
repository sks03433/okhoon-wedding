// 터치 이벤트 관련 변수 (잠금 해제용)
let startY = 0;

// 페이지가 로드되면 실행
window.onload = function() {
    const lockScreen = document.getElementById('lock-screen');
    
    // 1. 잠금 해제 스와이프 이벤트 설정
    lockScreen.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    });

    lockScreen.addEventListener('touchend', (e) => {
        let endY = e.changedTouches[0].clientY;
        if (startY - endY > 50) { // 50px 이상 위로 올렸을 때
            lockScreen.classList.add('slide-up');
            setTimeout(() => {
                lockScreen.classList.add('hidden');
                document.getElementById('home-screen').classList.remove('hidden');
            }, 500);
        }
    });

    // 2. LocalStorage에서 방명록 글 미리 불러와서 렌더링하기
    renderComments();
};

// 배경음악 재생 제어
function toggleMusic() {
    const bgm = document.getElementById('bgm');
    const btn = document.getElementById('music-btn');
    const icon = document.getElementById('music-icon');

    if (bgm.paused) {
        bgm.play().then(() => {
            btn.classList.add('playing');
            icon.className = "fa-solid fa-compact-disc fa-spin"; 
        }).catch(err => {
            console.log("자동 재생 차단 해결용 클릭 필요: ", err);
        });
    } else {
        bgm.pause();
        btn.classList.remove('playing');
        icon.className = "fa-solid fa-music"; 
    }
}

// 오시는 길 팝업 열기/닫기
function openMap() {
    document.getElementById('map-page').classList.remove('hidden');
}
function closeMap() {
    document.getElementById('map-page').classList.add('hidden');
}

// 주소 복사하기 기능
function copyAddress() {
    const addressText = "경기 수원시 팔달구 중부대로 181";
    navigator.clipboard.writeText(addressText).then(() => {
        alert("주소가 클립보드에 복사되었습니다!");
    }).catch(err => {
        alert("복사에 실패했습니다. 직접 복사해주세요.");
    });
}


/* 📝 [NEW] 방명록(메모 앱) 관련 기능 로직 */

// 방명록 창 열기/닫기
function openGuestbook() {
    document.getElementById('guestbook-page').classList.remove('hidden');
    renderComments(); // 창 열 때 최신 글 목록 동기화
}
function closeGuestbook() {
    document.getElementById('guestbook-page').classList.add('hidden');
}

// 댓글 저장하기
function addComment() {
    const nameInput = document.getElementById('gb-name');
    const pwdInput = document.getElementById('gb-password');
    const contentInput = document.getElementById('gb-content');

    const name = nameInput.value.trim();
    const password = pwdInput.value.trim();
    const content = contentInput.value.trim();

    if (!name) { alert('이름을 입력해 주세요.'); return; }
    if (!password || password.length < 4) { alert('비밀번호 4자리를 입력해 주세요.'); return; }
    if (!content) { alert('축하 메시지 내용을 입력해 주세요.'); return; }

    // 현재 날짜 생성 (YYYY.MM.DD)
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;

    // 새로운 댓글 객체 생성
    const newComment = {
        id: Date.now(), // 유니크한 ID값 생성용
        name: name,
        password: password,
        content: content,
        date: dateStr
    };

    // 로컬스토리지에서 기존 댓글 리스트 가져와 추가하기
    let comments = JSON.parse(localStorage.getItem('wedding_guestbook')) || [];
    comments.unshift(newComment); // 최신글이 맨 위로 올라오도록 세팅

    localStorage.setItem('wedding_guestbook', JSON.stringify(comments));

    // 인풋창 초기화
    nameInput.value = '';
    pwdInput.value = '';
    contentInput.value = '';

    // 화면 다시 렌더링
    renderComments();
}

// 댓글 목록 화면에 뿌려주기
function renderComments() {
    const listContainer = document.getElementById('guestbook-list');
    const countSpan = document.getElementById('gb-count');
    let comments = JSON.parse(localStorage.getItem('wedding_guestbook')) || [];

    countSpan.innerText = comments.length;
    listContainer.innerHTML = ''; // 기존 리스트 밀어버리기

    if (comments.length === 0) {
        listContainer.innerHTML = `<div style="text-align:center; color:#8e8e93; font-size:0.9rem; padding:40px 0;">첫 번째 축하 메모를 남겨주세요!</div>`;
        return;
    }

    comments.forEach(comment => {
        const item = document.createElement('div');
        item.className = 'gb-comment-box';
        item.innerHTML = `
            <div class="gb-comment-header">
                <span class="gb-comment-name">${escapeHtml(comment.name)}</span>
                <div>
                    <span class="gb-comment-date">${comment.date}</span>
                    <button class="gb-delete-btn" onclick="deleteComment(${comment.id})">삭제</button>
                </div>
            </div>
            <div class="gb-comment-text">${escapeHtml(comment.content)}</div>
        `;
        listContainer.appendChild(item);
    });
}

// 댓글 삭제 기능 (하객 비번 확인 및 마스터 권한 체크)
function deleteComment(id) {
    const inputPwd = prompt('비밀번호를 입력하세요:');
    if (inputPwd === null) return; // 취소 버튼을 눌렀을 때

    let comments = JSON.parse(localStorage.getItem('wedding_guestbook')) || [];
    const target = comments.find(c => c.id === id);

    if (!target) {
        alert('해당 메모가 존재하지 않습니다.');
        return;
    }

    // 하객 비밀번호 일치 또는 관리자 마스터 키('okhoon0719') 패스 검증
    if (inputPwd === target.password || inputPwd === 'okhoon0719') {
        if (confirm('이 메모를 삭제하시겠습니까?')) {
            comments = comments.filter(c => c.id !== id);
            localStorage.setItem('wedding_guestbook', JSON.stringify(comments));
            renderComments();
        }
    } else {
        alert('비밀번호가 일치하지 않습니다.');
    }
}

// 보안용 스크립트 인젝션 차단 유틸리티 (XSS 방지)
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
