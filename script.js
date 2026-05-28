let startY = 0;
let isDragging = false;

// DOM 로드 완료 후 안전하게 스와이프 바인딩
document.addEventListener("DOMContentLoaded", function() {
    const lockScreen = document.getElementById('lock-screen');
    
    if (lockScreen) {
        // 모바일 터치
        lockScreen.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        }, { passive: true });

        lockScreen.addEventListener('touchend', (e) => {
            let endY = e.changedTouches[0].clientY;
            handleSwipe(startY, endY);
        }, { passive: true });

        // PC 마우스
        lockScreen.addEventListener('mousedown', (e) => {
            startY = e.clientY;
            isDragging = true;
        });

        lockScreen.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            let endY = e.clientY;
            isDragging = false;
            handleSwipe(startY, endY);
        });
    }
});

function handleSwipe(start, end) {
    const lockScreen = document.getElementById('lock-screen');
    const homeScreen = document.getElementById('home-screen');
    
    if (start - end > 40) { 
        if (lockScreen) lockScreen.classList.add('slide-up');
        setTimeout(() => {
            if (lockScreen) lockScreen.classList.add('hidden');
            if (homeScreen) homeScreen.classList.remove('hidden');
        }, 500);
    }
}

function toggleMusic() {
    const bgm = document.getElementById('bgm');
    const btn = document.getElementById('music-btn');
    const icon = document.getElementById('music-icon');

    if (!bgm) return;

    if (bgm.paused) {
        bgm.play().then(() => {
            if (btn) btn.classList.add('playing');
            if (icon) icon.className = "fa-solid fa-compact-disc fa-spin"; 
        }).catch(err => console.log(err));
    } else {
        bgm.pause();
        if (btn) btn.classList.remove('playing');
        if (icon) icon.className = "fa-solid fa-music"; 
    }
}

function openMap() { 
    const mapPage = document.getElementById('map-page');
    if (mapPage) mapPage.classList.remove('hidden'); 
}
// ✕ 버튼 누르면 닫히도록 완벽 구현 보존
function closeMap() { 
    const mapPage = document.getElementById('map-page');
    if (mapPage) mapPage.classList.add('hidden'); 
}

function copyAddress() {
    navigator.clipboard.writeText("경기 수원시 팔달구 중부대로 181").then(() => {
        alert("주소가 복사되었습니다!");
    });
}

/* 🌐 실시간 방명록 연동 로직 */
function openGuestbook() {
    const gbPage = document.getElementById('guestbook-page');
    if (gbPage) gbPage.classList.remove('hidden');
    listenComments(); 
}
function closeGuestbook() {
    const gbPage = document.getElementById('guestbook-page');
    if (gbPage) gbPage.classList.add('hidden');
}

function addComment() {
    const nameInput = document.getElementById('gb-name');
    const pwdInput = document.getElementById('gb-password');
    const contentInput = document.getElementById('gb-content');

    if (!nameInput || !pwdInput || !contentInput) return;

    const name = nameInput.value.trim();
    const password = pwdInput.value.trim();
    const content = contentInput.value.trim();

    if (!name) { alert('이름을 입력해 주세요.'); return; }
    if (!password || password.length < 4) { alert('비밀번호 4자리를 입력해 주세요.'); return; }
    if (!content) { alert('메시지를 입력해 주세요.'); return; }

    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;

    if (typeof database !== 'undefined' && database !== null) {
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
}

function listenComments() {
    if (typeof database === 'undefined' || database === null) return;
    
    database.ref('guestbook').orderByChild('timestamp').on('value', (snapshot) => {
        const listContainer = document.getElementById('guestbook-list');
        const countSpan = document.getElementById('gb-count');
        
        if (!listContainer || !countSpan) return;
        
        listContainer.innerHTML = '';
        let commentsArray = [];

        snapshot.forEach((childSnapshot) => {
            const key = childSnapshot.key;
            const data = childSnapshot.val();
            commentsArray.push({ id: key, ...data });
        });

        commentsArray.reverse(); 
        countSpan.innerText = commentsArray.length;

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

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
