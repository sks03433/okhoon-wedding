// 헬퍼 함수 정의를 최상단으로 이동 (에러 유발 방지 및 코드 보호 순정 유지)
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

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

/* 🌐 실시간 방명록 서버 연동 로직 */

function openGuestbook() {
    document.getElementById('guestbook-page').classList.remove('hidden');
    listenComments(); // 실시간 데이터 실시간 감시 시작
}
function closeGuestbook() {
    document.getElementById('guestbook-page').classList.add('hidden');
}

// 파이어베이스 데이터베이스로 실시간 전송
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

    // Firebase 데이터베이스의 'guestbook' 노드에 push(저장)
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

// 데이터베이스를 실시간으로 Listen 하여 화면에 반영하기
function listenComments() {
    database.ref('guestbook').orderByChild('timestamp').on('value', (snapshot) => {
        const listContainer = document.getElementById('guestbook-list');
        const countSpan = document.getElementById('gb-count');
        
        if(!listContainer) return;
        
        listContainer.innerHTML = '';
        let commentsArray = [];

        snapshot.forEach((childSnapshot) => {
            const key = childSnapshot.key; // 고유 데이터 키값
            const data = childSnapshot.val();
            commentsArray.push({ id: key, ...data });
        });

        // 내림차순 정렬 (최신글 위로)
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

// 삭제 로직 (서버 데이터 삭제 반영)
function deleteComment(id, targetPassword) {
    const inputPwd = prompt('비밀번호를 입력하세요:');
    if (inputPwd === null) return;

    // 본인 패스워드 검증 혹은 마스터 관리자 번호 통과 권한 완벽 보존!
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
// 참석 여부 창 제어
function openRSVP() { document.getElementById('rsvp-page').classList.remove('hidden'); }
function closeRSVP() { document.getElementById('rsvp-page').classList.add('hidden'); }

// 옵션 선택 버튼 처리
function selectOpt(btn) {
    const type = btn.getAttribute('data-type');
    // 같은 타입의 다른 버튼들 비활성화
    document.querySelectorAll(`.rsvp-opt-btn[data-type="${type}"]`).forEach(b => {
        b.classList.remove('active');
    });
    // 클릭한 버튼 활성화
    btn.classList.add('active');
}

// 참석 의사 저장 (Firebase 연동)
function submitRSVP() {
    const name = document.getElementById('rsvp-name').value.trim();
    if (!name) { alert('성함을 입력해 주세요.'); return; }

    const side = document.querySelector('.rsvp-opt-btn[data-type="side"].active').getAttribute('data-value');
    const attend = document.querySelector('.rsvp-opt-btn[data-type="attend"].active').getAttribute('data-value');
    const meal = document.querySelector('.rsvp-opt-btn[data-type="meal"].active').getAttribute('data-value');
    const count = document.getElementById('rsvp-count').value;

    const now = new Date();
    const timeStr = now.toLocaleString();

    // Firebase 'rsvp' 노드에 저장
    database.ref('rsvp').push({
        name: name,
        side: side,
        attend: attend,
        meal: meal,
        count: count,
        time: timeStr,
        timestamp: Date.now()
    }).then(() => {
        alert('소중한 의사가 신랑·신부님께 전달되었습니다. 감사합니다!');
        closeRSVP();
        // 입력값 초기화
        document.getElementById('rsvp-name').value = '';
    }).catch(err => alert("전송 실패: " + err.message));
}
