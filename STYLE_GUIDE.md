/*
공통 스타일 구조/네이밍/반응형/일원화 가이드 (2025-08-07)

1. 공통 CSS는 src/assets/css/main.css에서 한 번만 import, main.js에서 global 적용
2. detail 하위 컴포넌트에서는 @import 사용 금지, 개별 스타일만 scoped로 작성
3. 인라인 style은 class 기반으로 통일, 필요한 클래스는 tables.css 등 공통 CSS에 추가
4. 공통 클래스 네이밍 규칙:
   - .manage-th, .cursor-pointer, .cursor-default, .inline-block, .minw-110, .d-none 등
5. 반응형 레이아웃/스타일은 employee-list/responsive.css에 통합, 컴포넌트에서는 grid/flex만 선언
6. 새로운 detail/테이블/폼 컴포넌트도 위 규칙을 반드시 준수

예시)
- <th class="manage-th">관리</th>
- <CommonInput class="cursor-pointer" ... />
- <span class="info-input plain-input inline-block minw-110 cursor-pointer" ... />

반응형 예시)
@media (max-width: 1024px) {
  .resume-content { grid-template-columns: 1fr; gap: 20px; padding: 16px; }
}
@media (max-width: 600px) {
  .resume-bg { padding: 4px; }
  .resume-container { max-width: 100%; padding: 0; }
}

이 가이드에 따라 신규/기존 컴포넌트 스타일 구조를 통일하세요.
