function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// 🎯 스와이프 및 클릭 제어 전역 변수
let startY = 0; 
let isDragging = false;

window.onload = function() {
    const lockScreen = document.getElementById('lock-screen');
    const homeScreen = document.getElementById('home-screen');
    
    if (!lockScreen || !homeScreen) return;

    // 🔓 화면 전환을 실행하는 핵심 공통 함수
    function unlock() {
        lockScreen.classList.add('slide-up');
        homeScreen.classList.remove('hidden'); 
        setTimeout(() => {
            lockScreen.classList.add('hidden');
        }, 500);
    }

    // 1. [모바일] 터치 이벤트 처리
    lockScreen.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    }, { passive: true });

    lockScreen.addEventListener('touchmove', (e) => {
        if (e.cancelable) e.preventDefault(); // 브라우저 스크롤 오작동 차단
    }, { passive: false });

    lockScreen.addEventListener('touchend', (e) => {
        let endY = e.changedTouches[0].clientY;
        if (startY - endY > 40) { // 40px 이상 위로 밀면 해제
            unlock();
        }
    }, { passive: true });

    // 2. [PC 크롬 개발자도구/마우스] 드래그 이벤트 처리
    lockScreen.addEventListener('mousedown', (e) => {
        startY = e.clientY;
        isDragging = true;
    });

    lockScreen.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        let endY = e.clientY;
        if (startY - endY > 40) { // 마우스로 위로 밀어도 해제
            unlock();
        }
    });

    // 3. [최후의 보루] 스와이프가 아예 안 먹히는 환경용: "그냥 클릭해도 열리기"
    lockScreen.addEventListener('click', (e) => {
        // 텍스트나 빈 공간을 그냥 '터치'하거나 '클릭'하기만 해도 열리도록 보장
        unlock();
    });
};

// 이하 기존 다른 함수들(toggleMusic, openMap 등)은 그대로 유지...

// 🎵 음악 재생 제어
function toggleMusic() {
    const bgm = document.getElementById('bgm');
    const appBox = document.getElementById('music-app-box');

    if (bgm.paused) {
        bgm.play().then(() => {
            appBox.classList.add('playing');
        }).catch(err => console.log(err));
    } else {
        bgm.pause();
        appBox.classList.remove('playing');
    }
}

// 지도 열고 닫기
function openMap() { document.getElementById('map-page').classList.remove('hidden'); }
function closeMap() { document.getElementById('map-page').classList.add('hidden'); }

function copyAddress() {
    navigator.clipboard.writeText("경기 수원시 팔달구 중부대로 181").then(() => {
        alert("주소가 복사되었습니다!");
    });
}

// 방명록 제어
function openGuestbook() {
    document.getElementById('guestbook-page').classList.remove('hidden');
    listenComments();
}
function closeGuestbook() {
    document.getElementById('guestbook-page').classList.add('hidden');
}

function addComment() {
    const nameInput = document.getElementById('gb-name');
    const pwdInput = document.getElementById('gb-password');
    const contentInput = document.getElementById('gb-content');

    const name = nameInput.value.trim();
    const password = pwdInput.value.trim();
    const content = contentInput.value.trim();

    if (!name) { alert('이름을 입력해 주세요.'); return; }
    if (!password || password.length < 4) { alert('비밀번호 4자리를 입력해 주세요.'); return; }
    if (!content) { alert('메시지를 입력해 주세요.'); return; }

    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;

    database.ref('guestbook').push({
        name: name,
        password: password,
        content: content,
        date: dateStr,
        timestamp: Date.now()
    }).then(() => {
        nameInput.value = '';
        pwdInput.value = '';
        contentInput.value = '';
    }).catch(err => alert("저장 실패: " + err.message));
}

function listenComments() {
    database.ref('guestbook').orderByChild('timestamp').on('value', (snapshot) => {
        const listContainer = document.getElementById('guestbook-list');
        const countSpan = document.getElementById('gb-count');
        
        if(!listContainer) return;
        listContainer.innerHTML = '';
        let commentsArray = [];

        snapshot.forEach((childSnapshot) => {
            const key = childSnapshot.key;
            const data = childSnapshot.val();
            commentsArray.push({ id: key, ...data });
        });

        commentsArray.reverse();
        if(countSpan) countSpan.innerText = commentsArray.length;

        if (commentsArray.length === 0) {
            listContainer.innerHTML = `<div style="text-align:center; color:#8e8e93; font-size:0.9rem; padding:40px 0;">첫 번째 축하 메모를 남겨주세요!</div>`;
            return;
        }

        commentsArray.forEach(comment => {
            const item = document.createElement('div');
            item.className = 'gb-comment-box';
            item.innerHTML = `
                <div class="gb-comment-header">
                    <span class="gb-comment-name">${escapeHtml(comment.name)}</span>
                    <div>
                        <span class="gb-comment-date">${comment.date}</span>
                        <button class="gb-delete-btn" onclick="deleteComment('${comment.id}', '${comment.password}')">삭제</button>
                    </div>
                </div>
                <div class="gb-comment-text">${escapeHtml(comment.content)}</div>
            `;
            listContainer.appendChild(item);
        });
    });
}

function deleteComment(id, targetPassword) {
    const inputPwd = prompt('비밀번호를 입력하세요:');
    if (inputPwd === null) return;

    if (inputPwd === targetPassword || inputPwd === 'okhoon0719') {
        if (confirm('이 메모를 삭제하시겠습니까?')) {
            database.ref('guestbook/' + id).remove()
                .then(() => alert("삭제되었습니다."))
                .catch(err => alert("삭제 실패: " + err.message));
        }
    } else {
        alert('비밀번호가 일치하지 않습니다.');
    }
}

// 참석 여부 제어
function openRSVP() { document.getElementById('rsvp-page').classList.remove('hidden'); }
function closeRSVP() { document.getElementById('rsvp-page').classList.add('hidden'); }

function selectOpt(btn) {
    const type = btn.getAttribute('data-type');
    document.querySelectorAll(`.rsvp-opt-btn[data-type="${type}"]`).forEach(b => {
        b.classList.remove('active');
    });
    btn.classList.add('active');
}

function submitRSVP() {
    const nameInput = document.getElementById('rsvp-name');
    const name = nameInput.value.trim();
    if (!name) { alert('성함을 입력해 주세요.'); return; }

    const side = document.querySelector('.rsvp-opt-btn[data-type="side"].active').getAttribute('data-value');
    const attend = document.querySelector('.rsvp-opt-btn[data-type="attend"].active').getAttribute('data-value');
    const meal = document.querySelector('.rsvp-opt-btn[data-type="meal"].active').getAttribute('data-value');
    const count = document.getElementById('rsvp-count').value;

    const now = new Date();
    const timeStr = now.toLocaleString();

    database.ref('rsvp').push({
        name: name,
        side: side,
        attend: attend,
        meal: meal,
        count: count,
        time: timeStr,
        timestamp: Date.now()
    }).then(() => {
        alert('소중한 참석 의사가 신랑·신부님께 잘 전달되었습니다. 감사합니다!');
        closeRSVP();
        nameInput.value = '';
    }).catch(err => alert("전송 실패: " + err.message));
}
