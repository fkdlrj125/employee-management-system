# Responsive CSS

반응형 디자인 관련 스타일들을 모아놓은 폴더입니다.

## 파일 설명

### employee-list-responsive.css
- **용도**: 직원 목록 페이지의 반응형 스타일
- **사용 페이지**: EmployeeList.vue
- **포함 스타일**: 
  - 데스크톱/태블릿/모바일 반응형
  - 다크모드 호환성
  - 컨테이너 레이아웃 조정

### mobile-cards.css
- **용도**: 모바일에서 테이블 대신 사용할 카드 스타일
- **사용 페이지**: EmployeeList.vue (모바일 뷰)
- **포함 스타일**: 
  - .employee-card
  - .mobile-card-container
  - 카드 애니메이션
  - 반응형 카드 레이아웃

## 향후 계획

다른 페이지의 반응형 스타일도 이 폴더에 추가됩니다:

- **employee-detail-responsive.css**: 직원 상세 페이지 반응형
- **common-responsive.css**: 공통 반응형 스타일
- **tablet.css**: 태블릿 전용 스타일
- **desktop.css**: 데스크톱 전용 스타일

## 브레이크포인트

```css
/* 모바일 */
@media (max-width: 768px) { }

/* 태블릿 */
@media (max-width: 1200px) { }

/* 데스크톱 */
@media (min-width: 1201px) { }
```
