/**
 * 참석 의사(RSVP) + 축의금 접수 → 구글 시트 저장용 Apps Script
 *
 * 사용 방법:
 * 1. 구글 시트 새 문서 생성
 * 2. 확장 프로그램 → Apps Script
 * 3. 이 파일 내용을 붙여넣고 저장
 * 4. 배포 → 새 배포 → 유형: 웹 앱
 *    - 실행 계정: 나
 *    - 액세스 권한: 모든 사용자
 * 5. 배포 후 나온 웹 앱 URL을 script.js 의 RSVP_SHEET_URL,
 *    gift/index.html 의 SHEET_URL 에 넣기
 *
 * 코드를 수정한 뒤에는 배포 관리 → 수정 → 새 버전으로 다시 배포해야 반영됩니다.
 */

var SHEET_NAME = 'RSVP';
var GIFT_SHEET_NAME = '축의금';
var GIFT_HEADER = [
  '등록시각',
  '순번',
  '구분',
  '관계',
  '성함',
  '휴대폰번호',
  '금액',
  '식권_대인',
  '식권_소인',
  '비고',
  '수정시각',
  '기기'
];
var GIFT_COL_SEQ = 2;
var GIFT_COL_DEVICE = 12;

function ensureHeader_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      '제출시각',
      '성함',
      '전화뒤4자리',
      '구분',
      '참석여부',
      '식사여부',
      '동반인원',
      'timestamp'
    ]);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
  }
}

function ensureGiftHeader_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(GIFT_HEADER);
    sheet.getRange(1, 1, 1, GIFT_HEADER.length).setFontWeight('bold');
    // 휴대폰번호 앞자리 0이 사라지지 않도록 텍스트 서식
    sheet.getRange(1, 6, sheet.getMaxRows(), 1).setNumberFormat('@');
    sheet.setFrozenRows(1);
  } else if (sheet.getRange(1, GIFT_COL_DEVICE).getValue() === '') {
    // 이전 버전에서 만든 탭에는 '기기' 열 제목이 없다
    sheet.getRange(1, GIFT_COL_DEVICE).setValue(GIFT_HEADER[GIFT_COL_DEVICE - 1]).setFontWeight('bold');
  }
}

function getSheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function formatSeoulDateTime_(date) {
  return Utilities.formatDate(date, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
}

function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleRsvp_(data) {
  var sheet = getSheet_(SHEET_NAME);
  ensureHeader_(sheet);

  var now = new Date();
  // 클라이언트 시간대와 무관하게 한국 시간으로 제출시각 기록
  var submittedAt = formatSeoulDateTime_(now);

  sheet.appendRow([
    submittedAt,
    data.name || '',
    // 앞의 ' 는 숫자 변환을 막아 0437 같은 앞자리 0을 유지한다 (시트에는 보이지 않음)
    data.phone4 ? "'" + data.phone4 : '',
    data.side || '',
    data.attend || '',
    data.meal || '',
    data.count || '',
    data.timestamp || now.getTime()
  ]);
}

// 접수 기기마다 1번부터 세므로 기기 + 순번으로 행을 찾는다
function findGiftRow_(sheet, device, seq) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  var values = sheet.getRange(2, 1, lastRow - 1, GIFT_HEADER.length).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][GIFT_COL_DEVICE - 1]) === String(device) &&
        Number(values[i][GIFT_COL_SEQ - 1]) === Number(seq)) {
      return i + 2;
    }
  }
  return -1;
}

function giftRowValues_(data) {
  return [
    data.seq || '',
    data.side || '',
    data.rel || '',
    data.name || '',
    data.phone || '',
    Number(data.amount) || 0,
    Number(data.adult) || 0,
    Number(data.child) || 0,
    data.note || ''
  ];
}

function handleGift_(data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = getSheet_(GIFT_SHEET_NAME);
    ensureGiftHeader_(sheet);
    var now = formatSeoulDateTime_(new Date());
    var row = findGiftRow_(sheet, data.device, data.seq);

    if (data.action === 'add') {
      // 재전송으로 같은 건이 다시 와도 행이 중복되지 않게 한다
      if (row === -1) {
        sheet.appendRow([now].concat(giftRowValues_(data), ['', data.device || '']));
      } else {
        sheet.getRange(row, 2, 1, 9).setValues([giftRowValues_(data)]);
      }
      return;
    }

    if (row === -1) return;

    if (data.action === 'update') {
      sheet.getRange(row, 2, 1, 9).setValues([giftRowValues_(data)]);
      sheet.getRange(row, 11).setValue(now);
      return;
    }

    // 봉투에 적은 번호와 맞추기 위해 삭제해도 다른 행의 순번은 바꾸지 않는다
    if (data.action === 'delete') {
      sheet.deleteRow(row);
    }
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.type === 'gift') {
      handleGift_(data);
    } else {
      handleRsvp_(data);
    }
    return jsonOutput_({ ok: true });
  } catch (err) {
    return jsonOutput_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonOutput_({ ok: true, message: 'RSVP webhook is ready' });
}
