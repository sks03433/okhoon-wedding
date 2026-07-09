function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

let startY = 0;
let isDragging = false;

function unlockScreen() {
    const lockScreen = document.getElementById('lock-screen');
    if (lockScreen.classList.contains('slide-up') || lockScreen.classList.contains('hidden')) return;

    lockScreen.classList.add('slide-up');
    setTimeout(() => {
        lockScreen.classList.add('hidden');
        document.getElementById('home-screen').classList.remove('hidden');
    }, 500);
}

function onPointerStart(clientY) {
    startY = clientY;
    isDragging = true;
}

function onPointerEnd(clientY) {
    if (!isDragging) return;
    isDragging = false;
    const deltaY = startY - clientY;
    // 위로 스와이프하거나, 탭/클릭(거의 움직임 없음)이면 열기
    if (deltaY > 50 || Math.abs(deltaY) < 10) {
        unlockScreen();
    }
}

window.onload = function() {
    const lockScreen = document.getElementById('lock-screen');

    // 터치 (모바일)
    lockScreen.addEventListener('touchstart', (e) => {
        onPointerStart(e.touches[0].clientY);
    }, { passive: true });

    lockScreen.addEventListener('touchend', (e) => {
        onPointerEnd(e.changedTouches[0].clientY);
    }, { passive: true });

    // 마우스 드래그 (PC)
    lockScreen.addEventListener('mousedown', (e) => {
        onPointerStart(e.clientY);
    });

    window.addEventListener('mouseup', (e) => {
        onPointerEnd(e.clientY);
    });

    lockScreen.addEventListener('mouseleave', (e) => {
        if (isDragging) onPointerEnd(e.clientY);
    });

    lockScreen.addEventListener('click', () => {
        unlockScreen();
    });
};

function toggleMusic() {
    const bgm = document.getElementById('bgm');
    const musicIcon = document.getElementById('music-top-btn');

    if (bgm.paused) {
        bgm.play().then(() => {
            if (musicIcon) musicIcon.classList.add('playing');
        }).catch(err => console.log(err));
    } else {
        bgm.pause();
        if (musicIcon) musicIcon.classList.remove('playing');
    }
}

function openMap() { document.getElementById('map-page').classList.remove('hidden'); }
function closeMap() { document.getElementById('map-page').classList.add('hidden'); }

function copyAddress() {
    navigator.clipboard.writeText("경기 수원시 팔달구 중부대로 181").then(() => {
        alert("주소가 복사되었습니다!");
    });
}

function openGuestbook() {
    document.getElementById('guestbook-page').classList.remove('hidden');
    listenComments();
}
function closeGuestbook() {
    document.getElementById('guestbook-page').classList.add('hidden');
}

function openNotice() {
    document.getElementById('notice-page').classList.remove('hidden');
}
function closeNotice() {
    document.getElementById('notice-page').classList.add('hidden');
}

function openStory() {
    document.getElementById('story-page').classList.remove('hidden');
}
function closeStory() {
    document.getElementById('story-page').classList.add('hidden');
}

// 갤러리
const GALLERY_IMAGES = [
    'gallery/01.jpg',
    'gallery/02.jpg',
    // 사진 추가 시 아래에 경로를 이어서 넣어주세요.
    // 'gallery/03.jpg',
    // 'gallery/04.jpg',
];

let currentGalleryIndex = 0;

function openGallery() {
    document.getElementById('gallery-page').classList.remove('hidden');
    renderGallery();
}

function closeGallery() {
    document.getElementById('gallery-page').classList.add('hidden');
    closeGalleryLightbox();
}

function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    grid.innerHTML = '';
    GALLERY_IMAGES.forEach((src, index) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'gallery-thumb';
        item.onclick = () => openGalleryLightbox(index);
        item.innerHTML = `<img src="${src}" alt="갤러리 사진 ${index + 1}" loading="lazy">`;
        grid.appendChild(item);
    });
}

function openGalleryLightbox(index) {
    currentGalleryIndex = index;
    updateGalleryLightbox();
    document.getElementById('gallery-lightbox').classList.remove('hidden');
}

function closeGalleryLightbox() {
    const lightbox = document.getElementById('gallery-lightbox');
    if (lightbox) lightbox.classList.add('hidden');
}

function closeGalleryLightboxOnBackdrop(event) {
    if (event.target.id === 'gallery-lightbox') {
        closeGalleryLightbox();
    }
}

function updateGalleryLightbox() {
    const img = document.getElementById('gallery-lightbox-img');
    const counter = document.getElementById('gallery-lightbox-counter');
    if (!img || GALLERY_IMAGES.length === 0) return;

    img.src = GALLERY_IMAGES[currentGalleryIndex];
    img.alt = `갤러리 사진 ${currentGalleryIndex + 1}`;
    if (counter) {
        counter.textContent = `${currentGalleryIndex + 1} / ${GALLERY_IMAGES.length}`;
    }
}

function prevGalleryImage(event) {
    if (event) event.stopPropagation();
    if (GALLERY_IMAGES.length === 0) return;
    currentGalleryIndex = (currentGalleryIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
    updateGalleryLightbox();
}

function nextGalleryImage(event) {
    if (event) event.stopPropagation();
    if (GALLERY_IMAGES.length === 0) return;
    currentGalleryIndex = (currentGalleryIndex + 1) % GALLERY_IMAGES.length;
    updateGalleryLightbox();
}

document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('gallery-lightbox');
    if (!lightbox || lightbox.classList.contains('hidden')) return;

    if (e.key === 'Escape') closeGalleryLightbox();
    if (e.key === 'ArrowLeft') prevGalleryImage();
    if (e.key === 'ArrowRight') nextGalleryImage();
});

// 📸 게스트 스냅 팝업 제어 함수
function openGuestSnap() {
    document.getElementById('snap-page').classList.remove('hidden');
}
function closeGuestSnap() {
    document.getElementById('snap-page').classList.add('hidden');
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

// ✉️ 마음 전하기 팝업 제어 함수
function openRemittance() {
    document.getElementById('remittance-page').classList.remove('hidden');
    switchRemitTab('groom'); // 열릴 때 기본적으로 신랑측이 보이도록 초기화
}

function closeRemittance() {
    document.getElementById('remittance-page').classList.add('hidden');
}

// 신랑측 / 신부측 탭 전환 함수
function switchRemitTab(side) {
    const tabGroom = document.getElementById('tab-groom');
    const tabBride = document.getElementById('tab-bride');
    const areaGroom = document.getElementById('area-groom');
    const areaBride = document.getElementById('area-bride');

    if (side === 'groom') {
        tabGroom.classList.add('active');
        tabBride.classList.remove('active');
        areaGroom.style.display = 'block';
        areaBride.style.display = 'none';
    } else {
        tabGroom.classList.remove('active');
        tabBride.classList.add('active');
        areaGroom.style.display = 'none';
        areaBride.style.display = 'block';
    }
}

// 계좌번호 복사 기능 함수
function copyAccount(accountInfo) {
    // 은행명과 계좌번호 숫자만 깔끔하게 추출하여 복사합니다.
    navigator.clipboard.writeText(accountInfo).then(() => {
        alert(`계좌번호가 복사되었습니다.\n(${accountInfo})`);
    }).catch(err => {
        console.error('복사 실패:', err);
    });
}
