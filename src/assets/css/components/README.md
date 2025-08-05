# Components CSS

재사용 가능한 컴포넌트 스타일들을 모아놓은 폴더입니다.

## 파일 설명

### buttons.css
- **용도**: 모든 버튼 스타일 (btn, btn-primary, btn-secondary, btn-pagination 등)
- **사용 페이지**: 전체 페이지 (공통 컴포넌트)
- **포함 스타일**: 
  - 기본 버튼 (.btn)
  - 색상별 버튼 (.btn-primary, .btn-secondary, .btn-success 등)
  - 크기별 버튼 (.btn-sm, .btn-lg)
  - 아웃라인 버튼 (.btn-outline-*)
  - 버튼 그룹 (.btn-group)

### tables.css
- **용도**: 테이블 관련 공통 스타일
- **사용 페이지**: 테이블이 있는 모든 페이지
- **포함 스타일**: 
  - 기본 테이블 스타일
  - 정렬 가능한 헤더
  - 반응형 테이블

## 사용 방법

각 컴포넌트는 독립적으로 사용할 수 있으며, main.css에서 import하여 전역적으로 적용됩니다.

```css
/* 예시: 버튼만 사용하고 싶은 경우 */
@import './components/buttons.css';
```
