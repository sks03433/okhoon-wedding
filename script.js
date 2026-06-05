function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// 스와이프 제어 전역 변수
let startY = 0; 
let isDragging = false;

// 🔓 [전역 함수] 언제 어디서 호출되든 무조건 잠금을 해제하는 마스터 키
function unlock() {
    console.log("Unlock 함수가 감지되었습니다!");
    const lockScreen = document.getElementById('lock-screen');
    const homeScreen = document.getElementById('home-screen');
    
    if (lockScreen && homeScreen) {
        lockScreen.classList.add('slide-up');  // 위로 올리기
        homeScreen.classList.remove('hidden'); // 홈 화면 노출
        
        setTimeout(() => {
            lockScreen.classList.add('hidden'); // 완전히 숨기기
        }, 500);
    }
}

window.onload = function() {
    const lockScreen = document.getElementById('lock-screen');
    if (!lockScreen) return;

    // 1. 모바일 터치 이벤트
    lockScreen.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    }, { passive: true });

    lockScreen.addEventListener('touchmove', (e) => {
        if (e.cancelable) e.preventDefault(); 
    }, { passive: false });

    lockScreen.addEventListener('touchend', (e) => {
        let endY = e.changedTouches[0].clientY;
        if (startY - endY > 30) { // 판정 기준 완화 (30px만 올려도 잠금 해제)
            unlock();
        }
    }, { passive: true });

    // 2. PC 마우스 드래그 이벤트
    lockScreen.addEventListener('mousedown', (e) => {
        startY = e.clientY;
        isDragging = true;
    });

    lockScreen.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        let endY = e.clientY;
        if (startY - endY > 30) {
            unlock();
        }
    });

    // 3. 터치 및 클릭 전체 영역 백업
    lockScreen.addEventListener('click', (e) => {
        // 긴급 해제 버튼을 누른 경우는 예외 처리
        if(e.target.id === 'emergency-btn') return;
        unlock();
    });
};

// 🎵 음악 재생 제어
function toggleMusic() {
    const bgm = document.getElementById('bgm');
    const appBox = document.getElementById('music-app-box');
    if (bgm.paused) {
        bgm.play().then(() => { appBox.classList.add('playing'); }).catch(err => console.log(err));
    } else {
        bgm.pause(); appBox.classList.remove('playing');
    }
}

function openMap() { document.getElementById('map-page').classList.remove('hidden'); }
function closeMap() { document.getElementById('map-page').classList.add('hidden'); }
function copyAddress() { navigator.clipboard.writeText("경기 수원시 팔달구 중부대로 181").then(() => { alert("주소가 복사되었습니다!"); }); }
function openGuestbook() { document.getElementById('guestbook-page').classList.remove('hidden'); listenComments(); }
function closeGuestbook() { document.getElementById('guestbook-page').classList.add('hidden'); }

function addComment() {
    const nameInput = document.getElementById('gb-name'); const pwdInput = document.getElementById('gb-password'); const contentInput = document.getElementById('gb-content');
    const name = nameInput.value.trim(); const password = pwdInput.value.trim(); const content = contentInput.value.trim();
    if (!name || !password || !content) { alert('빈칸을 모두 입력해 주세요.'); return; }
    const now = new Date(); const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;
    database.ref('guestbook').push({ name: name, password: password, content: content, date: dateStr, timestamp: Date.now() })
    .then(() => { nameInput.value = ''; pwdInput.value = ''; contentInput.value = ''; }).catch(err => alert(err.message));
}

function listenComments() {
    database.ref('guestbook').orderByChild('timestamp').on('value', (snapshot) => {
        const listContainer = document.getElementById('guestbook-list'); const countSpan = document.getElementById('gb-count');
        if(!listContainer) return; listContainer.innerHTML = ''; let commentsArray = [];
        snapshot.forEach((childSnapshot) => { commentsArray.push({ id: childSnapshot.key, ...childSnapshot.val() }); });
        commentsArray.reverse(); if(countSpan) countSpan.innerText = commentsArray.length;
        if (commentsArray.length === 0) { listContainer.innerHTML = `<div style="text-align:center; color:#8e8e93; padding:40px 0;">첫 메모를 남겨주세요!</div>`; return; }
        commentsArray.forEach(comment => {
            const item = document.createElement('div'); item.className = 'gb-comment-box';
            item.innerHTML = `<div class="gb-comment-header"><span class="gb-comment-name">${escapeHtml(comment.name)}</span><div><span class="gb-comment-date">${comment.date}</span><button class="gb-delete-btn" onclick="deleteComment('${comment.id}', '${comment.password}')">삭제</button></div></div><div class="gb-comment-text">${escapeHtml(comment.content)}</div>`;
            listContainer.appendChild(item);
        });
    });
}

function deleteComment(id, targetPassword) {
    const inputPwd = prompt('비밀번호 입력:'); if (inputPwd === null) return;
    if (inputPwd === targetPassword || inputPwd === 'okhoon0719') {
        if (confirm('삭제하시겠습니까?')) { database.ref('guestbook/' + id).remove().then(() => alert("삭제완료")); }
    } else { alert('비밀번호 불일치'); }
}

function openRSVP() { document.getElementById('rsvp-page').classList.remove('hidden'); }
function closeRSVP() { document.getElementById('rsvp-page').classList.add('hidden'); }
function selectOpt(btn) { const type = btn.getAttribute('data-type'); document.querySelectorAll(`.rsvp-opt-btn[data-type="${type}"]`).forEach(b => b.classList.remove('active')); btn.classList.add('active'); }
function submitRSVP() {
    const nameInput = document.getElementById('rsvp-name'); const name = nameInput.value.trim(); if (!name) { alert('성함을 입력해 주세요.'); return; }
    const side = document.querySelector('.rsvp-opt-btn[data-type="side"].active').getAttribute('data-value');
    const attend = document.querySelector('.rsvp-opt-btn[data-type="attend"].active').getAttribute('data-value');
    const meal = document.querySelector('.rsvp-opt-btn[data-type="meal"].active').getAttribute('data-value');
    const count = document.getElementById('rsvp-count').value;
    database.ref('rsvp').push({ name: name, side: side, attend: attend, meal: meal, count: count, time: new Date().toLocaleString(), timestamp: Date.now() })
    .then(() => { alert('전달되었습니다.'); closeRSVP(); nameInput.value = ''; }).catch(err => alert(err.message));
}
