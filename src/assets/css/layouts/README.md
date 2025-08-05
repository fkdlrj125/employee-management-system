# Layouts CSS

페이지 레이아웃 관련 스타일들을 모아놓은 폴더입니다.

## 파일 설명

### headers.css
- **용도**: 페이지 헤더 섹션 스타일
- **사용 페이지**: 
  - EmployeeList.vue (직원 목록 헤더)
  - 향후 추가될 다른 페이지의 헤더
- **포함 스타일**: 
  - .header-section
  - .header-actions
  - .user-info
  - 반응형 헤더 스타일

## 확장 계획

향후 다음과 같은 레이아웃 파일들을 추가할 예정입니다:

- **navigation.css**: 내비게이션 메뉴 스타일
- **containers.css**: 컨테이너 레이아웃 스타일
- **sidebars.css**: 사이드바 레이아웃 스타일
- **footers.css**: 푸터 스타일

## 사용 방법

레이아웃 스타일은 페이지의 구조적 요소들을 담당합니다.

```css
/* 예시: 헤더 스타일만 사용하고 싶은 경우 */
@import './layouts/headers.css';
```
