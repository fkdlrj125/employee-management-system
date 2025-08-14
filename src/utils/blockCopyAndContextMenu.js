// utils/blockCopyAndContextMenu.js
// 모든 화면에서 복사 및 우클릭(컨텍스트 메뉴) 차단

export function blockCopyAndContextMenu() {
  // 복사(클립보드) 차단
  document.addEventListener('copy', function(e) {
    e.preventDefault();
  });
  // 우클릭(컨텍스트 메뉴) 차단
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
}
