/**
 * 참석 의사(RSVP) → 구글 시트 저장용 Apps Script
 *
 * 사용 방법:
 * 1. 구글 시트 새 문서 생성
 * 2. 확장 프로그램 → Apps Script
 * 3. 이 파일 내용을 붙여넣고 저장
 * 4. 배포 → 새 배포 → 유형: 웹 앱
 *    - 실행 계정: 나
 *    - 액세스 권한: 모든 사용자
 * 5. 배포 후 나온 웹 앱 URL을 script.js 의 RSVP_SHEET_URL 에 넣기
 */

var SHEET_NAME = 'RSVP';

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

function formatSeoulDateTime_(date) {
  return Utilities.formatDate(date, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }
    ensureHeader_(sheet);

    var now = new Date();
    // 클라이언트 시간대와 무관하게 한국 시간으로 제출시각 기록
    var submittedAt = formatSeoulDateTime_(now);

    sheet.appendRow([
      submittedAt,
      data.name || '',
      data.phone4 || '',
      data.side || '',
      data.attend || '',
      data.meal || '',
      data.count || '',
      data.timestamp || now.getTime()
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: 'RSVP webhook is ready' }))
    .setMimeType(ContentService.MimeType.JSON);
}
