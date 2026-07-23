# okhoon-wedding

iOS 잠금화면 컨셉의 모바일·PC 대응 청첩장 웹사이트입니다.

## 실행 방법

정적 HTML 사이트이므로 로컬 서버로 열면 됩니다.

```bash
# Python
python3 -m http.server 8080

# 또는 npx
npx serve .
```

브라우저에서 `http://localhost:8080` 접속

> `file://`로 직접 열면 일부 기능(클립보드 복사, Firebase 등)이 동작하지 않을 수 있습니다.

## 배포

GitHub Pages, Netlify, Firebase Hosting 등 정적 호스팅에 그대로 업로드하면 됩니다.

### 카카오톡 링크 미리보기

카톡에 URL을 보내면 제목·설명·썸네일이 뜨도록 Open Graph 메타 태그가 `index.html`에 설정되어 있습니다.

- **사이트 URL**: https://sks03433.github.io/okhoon-wedding/
- **미리보기 이미지**: `og-image.jpg` (800×800)

배포 후 미리보기가 안 바뀌면 [카카오 공유하기 디버거](https://developers.kakao.com/tool/debugger/sharing)에서 URL을 넣고 **스크랩 / 캐시 비우기**를 하세요.

---

## 하객 사용법

### 잠금 화면
- **스와이프**(위로) / **탭·클릭** / **드래그**(PC)로 홈 화면 진입

### 홈 화면 메뉴

| 위치 | 메뉴 | 기능 |
|------|------|------|
| 상단 | 음악 재생 | BGM 재생/정지 |
| 1열 | 마음 전하기 | 축의금 계좌 안내 |
| 1열 | 게스트 스냅 | 사진 업로드 링크 (Dropbox) |
| 1열 | 방명록 | 축하 메시지 작성·조회 |
| 1열 | 공지사항 | 예식·주차·식사·촬영 안내 |
| 2열(독) | 우리 이야기 | 커플 소개·타임라인 |
| 2열(독) | 오시는 길 | 약도·지도·교통 안내 |
| 2열(독) | 갤러리 | 사진 4열 썸네일 + 크게 보기 |
| 2열(독) | 참석 여부 | RSVP 전달 |

### 갤러리
- 썸네일 **클릭** → 크게 보기
- **좌우 스와이프 / 드래그**(PC) → 이전·다음 사진
- **← →** 키보드, 화살표 버튼 지원
- 어두운 바깥 영역 클릭 또는 **Esc** → 닫기

### 방명록
- 이름, 비밀번호(4자리), 메시지 작성 후 등록
- 본인 비밀번호로 삭제 가능
- 관리자 비밀번호: `script.js`의 `deleteComment` 함수 참고

---

## 관리자 · 커스터마이징

### 파일 구조

```
okhoon-wedding/
├── index.html          # 페이지 구조·텍스트
├── style.css           # 스타일
├── script.js           # 동작·갤러리 목록·Firebase 로직
├── lock_photo.png      # 잠금 화면 배경
├── home_photo.png      # 홈 화면 배경
├── og-image.jpg        # 카톡/SNS 링크 미리보기 이미지
├── bgm.mp3             # 배경음악
├── venue_map.jpg       # 오시는 길 약도 이미지
├── venue_map.svg       # 약도 fallback (미사용 시)
├── gallery/            # 갤러리 사진 폴더
│   ├── 01.jpg
│   └── 02.jpg
├── profile/            # 미니 프로필 어린시절 사진
│   ├── groom-child.jpg
│   └── bride-child.jpg
└── 68efc2557f10d891ca18ba81_더아리엘 약도.pdf  # 약도 원본 PDF
```

### 배경 사진 변경

| 용도 | 파일 | CSS 위치 |
|------|------|----------|
| 잠금 화면 | `lock_photo.png` | `style.css` → `#lock-screen` |
| 홈 화면 | `home_photo.png` | `style.css` → `#home-screen` |

같은 파일명으로 덮어쓰면 됩니다. PNG 권장.

### 잠금 화면 날짜·시간

`index.html` → `#lock-screen` 영역

```html
<div class="date">2026-10-10 (SAT)</div>
<div class="time">14:50</div>
```

### 배경음악 변경

`bgm.mp3` 파일을 교체합니다.

### 갤러리 사진 추가

1. `gallery/` 폴더에 `03.jpg`, `04.jpg` … 추가
2. `script.js`의 `GALLERY_IMAGES` 배열에 경로 추가

```javascript
const GALLERY_IMAGES = [
    'gallery/01.jpg',
    'gallery/02.jpg',
    'gallery/03.jpg',
];
```

### 약도 이미지 갱신

PDF 첫 페이지를 `venue_map.jpg`로 변환합니다.

```bash
pip3 install pymupdf
python3 -c "
import fitz
doc = fitz.open('68efc2557f10d891ca18ba81_더아리엘 약도.pdf')
page = doc[0]
page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False).save('venue_map.jpg')
doc.close()
"
```

### 우리 이야기 수정

`index.html` → `#story-page` 섹션
- 커플 사진: `home_photo.png`
- 이름·타임라인·혼주 정보 직접 수정

### 미니 프로필 (혼주 인사 아래)

`index.html` → `#story-page` 안 `.story-mini-profile`
- 어린시절 사진: `profile/groom-child.jpg`, `profile/bride-child.jpg` 같은 이름으로 덮어쓰기
- 소개·다짐·MBTI 문구는 HTML에서 직접 수정
- 전화 아이콘: `href="#"` → `href="tel:01012345678"` 형식으로 교체

### 공지사항 수정

`index.html` → `#notice-page` 섹션

### 오시는 길 수정

`index.html` → `#map-page` 섹션
- 예식장명, 주소, 지하철·버스·주차 안내
- 카카오맵·네이버 지도 링크
- `script.js` → `copyAddress()` 복사 주소

### 마음 전하기(계좌) 수정

`index.html` → `#remittance-page` 섹션
- 신랑측·신부측 계좌번호·이름 수정

### 게스트 스냅 링크 변경

`index.html` → `#snap-page` 내 Dropbox 업로드 URL 수정

### Firebase (방명록 · 참석 여부)

`index.html` 상단 `firebaseConfig`에 프로젝트 설정이 있습니다.

- **방명록** → Realtime Database `guestbook` 노드
- **참석 여부** → Realtime Database `rsvp` 노드

Firebase Console에서 Realtime Database 규칙을 설정해야 합니다.  
방명록 삭제용 관리자 비밀번호는 `script.js` → `deleteComment()` 함수에 있습니다.

---

## PC / 모바일 지원

- **모바일**: 전체 화면
- **PC (768px 이상)**: 중앙 iPhone 비율 프레임으로 표시
- 잠금 화면: 스와이프·탭·클릭·드래그 모두 지원

---

## 기술 스택

- HTML / CSS / JavaScript (바닐라)
- Firebase Realtime Database 8.x
- Font Awesome 6
