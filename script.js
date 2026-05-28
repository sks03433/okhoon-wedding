let startY = 0;

window.onload = function() {
    const lockScreen = document.getElementById('lock-screen');
    
    lockScreen.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    });

    lockScreen.addEventListener('touchend', (e) => {
        let endY = e.changedTouches[0].clientY;
        if (startY - endY > 50) {
            lockScreen.classList.add('slide-up');
            setTimeout(() => {
                lockScreen.classList.add('hidden');
                document.getElementById('home-screen').classList.remove('hidden');
            }, 500);
        }
    });
};

// 배경음악 제어
function toggleMusic() {
    const bgm = document.getElementById('bgm');
    const btn = document.getElementById('music-btn');
    const icon = document.getElementById('music-icon');

    if (bgm.paused) {
        bgm.play().then(() => {
            btn.classList.add('playing');
            icon.className = "fa-solid fa-compact-disc fa-spin"; 
        }).catch(err => console.log(err));
    } else {
        bgm.pause();
        btn.classList.remove('playing');
        icon.className = "fa-solid fa-music"; 
    }
}

// 오시는 길 창 제어
function openMap() { document.getElementById('map-page').classList.remove('hidden'); }
function closeMap() { document.getElementById('map-page').classList.add('hidden'); }

function copyAddress() {
    navigator.clipboard.writeText("경기 수원시 팔달구 중부대로 181").then(() => {
        alert("주소가 복사되었습니다!");
    });
}

/* 🌐 실시간 방명록 연동 로직 */

function openGuestbook() {
    document.getElementById('guestbook-page').classList.remove('hidden');
    listenComments(); // 데이터 실시간 감시 및 동기화 시작
}
function closeGuestbook() {
    document.getElementById('guestbook-page').classList.add('hidden');
}

// 실시간 클라우드로 전송
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

// 실시간 데이터 가져와서 화면에 뿌려주기
function listenComments() {
    database.ref('guestbook').orderByChild('timestamp').on('value', (snapshot) => {
        const listContainer = document.getElementById('guestbook-list');
        const countSpan = document.getElementById('gb-count');
        
        listContainer.innerHTML = '';
        let commentsArray = [];

        snapshot.forEach((childSnapshot) => {
            const key = childSnapshot.key;
            const data = childSnapshot.val();
            commentsArray.push({ id: key, ...data });
        });

        commentsArray.reverse(); // 최신글이 상단으로
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

// 데이터 삭제 로직 (마스터 키 okhoon0719 사용 가능)
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
