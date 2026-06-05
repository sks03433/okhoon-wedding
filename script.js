// 1. 에러 전파 방지용 유틸리티 
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

let startY = 0;
let isUnlocked = false;

// 2. 잠금 해제 실행 코어를 최상단으로 분리 (절대 마비 안 됨)
function 도어오픈() {
    if (isUnlocked) return;
    isUnlocked = true;

    const lockScreen = document.getElementById('lock-screen');
    const homeScreen = document.getElementById('home-screen');
    
    if (lockScreen && homeScreen) {
        lockScreen.classList.add('slide-up');
        setTimeout(() => {
            lockScreen.classList.add('hidden');
            homeScreen.classList.remove('hidden');
        }, 500);
    }
}

// 3. 브라우저 로드 시 이벤트 바인딩
window.onload = function() {
    const lockScreen = document.getElementById('lock-screen');
    if (!lockScreen) return;
    
    // 모바일 터치 스와이프 감지
    lockScreen.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    }, { passive: true });

    lockScreen.addEventListener('touchmove', (e) => {
        if (e.cancelable) e.preventDefault();
    }, { passive: false });

    lockScreen.addEventListener('touchend', (e) => {
        let endY = e.changedTouches[0].clientY;
        if (startY - endY > 30) {
            도어오픈();
        }
    }, { passive: true });
};

// 4. 배경음악 제어 
function toggleMusic() {
    const bgm = document.getElementById('bgm');
    const btn = document.getElementById('music-btn');
    const icon = document.getElementById('music-icon');

    if (!bgm || !btn || !icon) return;

    if (bgm.paused) {
        bgm.play().then(() => {
            btn.classList.add('playing');
            icon.className = "fa-solid fa-music fa-beat"; 
        }).catch(err => console.log("BGM 재생 실패:", err));
    } else {
        bgm.pause();
        btn.classList.remove('playing');
        icon.className = "fa-solid fa-music"; 
    }
}

// 5. 오시는 길 내비게이션 창
function openMap() { document.getElementById('map-page').classList.remove('hidden'); }
function closeMap() { document.getElementById('map-page').classList.add('hidden'); }

function copyAddress() {
    navigator.clipboard.writeText("경기 수원시 팔달구 중부대로 181").then(() => {
        alert("주소가 복사되었습니다!");
    }).catch(() => {
        alert("경기 수원시 팔달구 중부대로 181");
    });
}

// 6. 방명록 연동 (트라이 캐치로 파이어베이스 마비 시 스크립트 다운 차단)
function openGuestbook() {
    document.getElementById('guestbook-page').classList.remove('hidden');
    try {
        listenComments();
    } catch(e) {
        console.error("방명록 로딩 실패:", e);
    }
}
function closeGuestbook() {
    document.getElementById('guestbook-page').classList.add('hidden');
}

function addComment() {
    if (!database) { alert("서버 연결에 실패했습니다."); return; }
    const nameInput = document.getElementById('gb-name');
    const pwdInput = document.getElementById('gb-password');
    const contentInput = document.getElementById('gb-content');

    const name = nameInput.value.trim();
    const password = pwdInput.value.trim();
    const content = contentInput.value.trim();

    if (!name || !password || !content) { alert('빈칸을 모두 입력해 주세요.'); return; }

    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;

    database.ref('guestbook').push({
        name: name,
        password: password,
        content: content,
        date: dateStr,
        timestamp: Date.now()
    }).then(() => {
        nameInput.value = ''; pwdInput.value = ''; contentInput.value = '';
    }).catch(err => alert("저장 실패: " + err.message));
}

function listenComments() {
    if (!database) return;
    database.ref('guestbook').orderByChild('timestamp').on('value', (snapshot) => {
        const listContainer = document.getElementById('guestbook-list');
        const countSpan = document.getElementById('gb-count');
        if(!listContainer) return;
        
        listContainer.innerHTML = '';
        let commentsArray = [];

        snapshot.forEach((childSnapshot) => {
            commentsArray.push({ id: childSnapshot.key, ...childSnapshot.val() });
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
    if (!database) return;
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

// 7. 참석 여부(RSVP) 제어
function openRSVP() { document.getElementById('rsvp-page').classList.remove('hidden'); }
function closeRSVP() { document.getElementById('rsvp-page').classList.add('hidden'); }

function selectOpt(btn) {
    const type = btn.getAttribute('data-type');
    document.querySelectorAll(`.rsvp-opt-btn[data-type="${type}"]`).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function submitRSVP() {
    if (!database) { alert("서버 연결에 실패했습니다."); return; }
    const nameInput = document.getElementById('rsvp-name');
    const name = nameInput.value.trim();
    if (!name) { alert('성함을 입력해 주세요.'); return; }

    const side = document.querySelector('.rsvp-opt-btn[data-type="side"].active').getAttribute('data-value');
    const attend = document.querySelector('.rsvp-opt-btn[data-type="attend"].active').getAttribute('data-value');
    const meal = document.querySelector('.rsvp-opt-btn[data-type="meal"].active').getAttribute('data-value');
    const count = document.getElementById('rsvp-count').value;

    database.ref('rsvp').push({
        name: name, side: side, attend: attend, meal: meal, count: count,
        time: new Date().toLocaleString(), timestamp: Date.now()
    }).then(() => {
        alert('소중한 참석 의사가 전달되었습니다. 감사합니다!');
        closeRSVP();
        nameInput.value = ''; 
    }).catch(err => alert("전송 실패: " + err.message));
}
