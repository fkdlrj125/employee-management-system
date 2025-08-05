# Pages CSS

페이지별 특화 스타일들을 모아놓은 폴더입니다.

## 폴더 구조

### employee-list/
직원 목록 페이지 (EmployeeList.vue) 관련 스타일들

#### employee-list.css
- **용도**: 직원 목록 페이지의 기본 스타일
- **포함 스타일**: 페이지 특화 기본 설정

#### search-filters.css  
- **용도**: 검색 및 필터 기능 관련 스타일
- **포함 스타일**: 
  - .search-filter-section
  - .search-bar
  - .search-input-group
  - .filter-controls
  - .filter-group

#### employee-table.css
- **용도**: 직원 테이블 관련 스타일  
- **포함 스타일**: 
  - .employee-table
  - .employee-row
  - .department-badge
  - .position-badge
  - .pagination-container
  - 테이블 반응형 스타일

## 향후 추가될 페이지

### employee-detail/
- **employee-detail.css**: 직원 상세 페이지 기본 스타일
- **employee-form.css**: 직원 정보 입력/수정 폼 스타일
- **tabs.css**: 탭 메뉴 스타일

### login/
- **login.css**: 로그인 페이지 스타일
- **auth-forms.css**: 인증 관련 폼 스타일

### dashboard/
- **dashboard.css**: 대시보드 페이지 스타일
- **widgets.css**: 대시보드 위젯 스타일

## 사용 방법

각 페이지 폴더의 스타일들은 해당 페이지에서만 사용되는 특화된 스타일들입니다.

```css
/* 직원 목록 페이지 전체 스타일 */
@import './pages/employee-list/employee-list.css';
@import './pages/employee-list/search-filters.css';
@import './pages/employee-list/employee-table.css';
```
