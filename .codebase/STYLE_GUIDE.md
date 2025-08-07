---
applyTo: '**'
---

# STYLE_GUIDE.md (디자인/스타일/구조/네이밍/반응형/폴더 구조 통합 가이드)

---
이 파일은 employee-management 시스템의 디자인, 스타일, UI/UX, 구조, 네이밍, 레이아웃, 반응형, 폴더 구조 등 모든 시각적/구조적 기준을 통합 관리합니다.
모든 정책/가이드/원칙/예시/폴더 구조/변경 이력 등은 이 파일 한 곳에서만 관리하며, .codebase 폴더 내 다른 가이드 파일은 deprecated 처리합니다.
---

## 주요 내용
- 공통 CSS는 src/assets/css/main.css에서 한 번만 import, main.js에서 global 적용
- detail 하위 컴포넌트에서는 @import 사용 금지, 개별 스타일만 scoped로 작성
- 인라인 style은 class 기반으로 통일, 필요한 클래스는 tables.css 등 공통 CSS에 추가
- 공통 클래스 네이밍 규칙: .manage-th, .cursor-pointer, .cursor-default, .inline-block, .minw-110, .d-none 등
- 반응형 레이아웃/스타일은 employee-list/responsive.css에 통합, 컴포넌트에서는 grid/flex만 선언
- 새로운 detail/테이블/폼 컴포넌트도 위 규칙을 반드시 준수
- section-title h4 border-bottom: 2px solid #007bff, padding-bottom 유지
- .table-section(테이블 컴포넌트) 내부에서는 padding/min-height 등 block 여백 조절 금지(상위에서만 제어)
- block 영역 높이/여백/패딩 등은 EmployeeDetail.vue 등 상위에서 일관 관리
- 스타일 일관성: 반응형, 여백, 구분선, 터치영역, 고정헤더, 메시지, 빈공간 최소화 등
- Vue 3 SFC, Options API, style scoped 사용
- UI/UX 개선 우선순위(여백, 터치영역, 고정헤더, 메시지, 빈공간 최소화 등) 반영
- section-title, section-block, table-section 등 네이밍 통일
- 컴포넌트 내부에서 block padding/min-height 등 레이아웃 조절 금지, 오직 상위에서만 관리
- 코드/스타일/구조 일관성 유지, 불필요한 중복/충돌 방지
- [폴더 구조 원칙] 모든 실제 소스/컴포넌트/스타일/설정 파일은 반드시 employee-management 폴더 하위에만 두고, 폴더 외부에는 두지 않는다. (코드베이스는 한 폴더에 집중 관리)

## 관리 원칙
- 이 STYLE_GUIDE.md는 employee-management/.codebase/ 폴더에서 디자인/스타일/구조/네이밍/반응형/폴더 구조 등 모든 기준을 통합 관리합니다.
- 실제 디자인/스타일/구조 가이드(design-style-structure.md 등)는 deprecated 처리하며, 향후 모든 변경사항은 반드시 이 파일에서만 관리

## [중요] 코드/스타일/구조 변경 사전 협의 원칙
- **모든 코드, 스타일, 레이아웃, 구조, 네이밍, 반응형 등 화면에 영향을 주는 변경은 반드시 담당자(혹은 PO/디자이너)와 사전 협의/승인 후 진행해야 함.**
- 사전 협의 없이 임의로 화면 구조/비율/스타일을 변경하는 행위는 금지하며, 변경 전 반드시 관련자에게 변경 의도와 내용을 설명하고 동의/승인을 받아야 함.
- 이 원칙은 상세페이지, 테이블, 차트, 레이아웃, 그리드, 반응형, 스타일 등 모든 UI/UX 코드에 적용됨.
- 위반 시 코드리뷰에서 반려 및 롤백될 수 있음.

## 기타
- 디자인/스타일/구조 관련 추가 가이드, 변경사항, 히스토리 등은 이 폴더(.codebase) 내에서만 통합 관리합니다.
- 실제 디자인 리소스, 예시, 참고 이미지, Figma/Sketch 등 외부 디자인 파일도 이 폴더에 보관 가능
