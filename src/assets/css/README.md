# CSS 폴더 구조

직원 관리 시스템의 CSS 파일들을 기능별로 체계적으로 정리한 폴더 구조입니다.

## 📁 폴더 구조

```
css/
├── base/                    # 기본 스타일 (리셋, 타이포그래피)
│   ├── reset.css           # CSS 리셋
│   └── typography.css      # 폰트 및 텍스트 스타일
├── components/              # 재사용 가능한 컴포넌트 스타일
│   ├── buttons.css         # 모든 버튼 스타일
│   └── tables.css          # 테이블 공통 스타일
├── layouts/                 # 레이아웃 관련 스타일
│   └── headers.css         # 페이지 헤더 스타일
├── responsive/              # 반응형 스타일
│   ├── employee-list-responsive.css
│   └── mobile-cards.css
├── animations/              # 애니메이션 스타일
│   └── transitions.css     # 트랜지션 및 키프레임
├── pages/                   # 페이지별 특화 스타일
│   └── employee-list/      # 직원 목록 페이지
│       ├── employee-list.css
│       ├── search-filters.css
│       └── employee-table.css
├── themes/                  # 테마 관련 (향후 확장)
├── common.css              # 공통 스타일
└── main.css               # 모든 CSS 파일을 import하는 메인 파일
```

## 🎯 설계 원칙

### 1. 모듈화 (Modularity)
- 기능별로 CSS 파일을 분리하여 유지보수성 향상
- 각 파일은 단일 책임 원칙을 따름

### 2. 재사용성 (Reusability)  
- `components/` 폴더의 스타일들은 여러 페이지에서 재사용 가능
- `layouts/` 폴더의 스타일들은 공통 레이아웃에서 사용

### 3. 확장성 (Scalability)
- 새로운 페이지 추가 시 `pages/` 폴더에 새 하위 폴더 생성
- 새로운 컴포넌트 추가 시 `components/` 폴더에 추가

### 4. 명확성 (Clarity)
- 폴더와 파일명이 용도를 명확히 표현
- 각 폴더에 README.md 파일로 문서화

## 🔄 Import 순서

main.css에서 다음 순서로 import합니다:

1. **Base**: 기본 리셋 및 타이포그래피
2. **Common**: 공통 스타일
3. **Components**: 재사용 컴포넌트
4. **Layouts**: 레이아웃 구조
5. **Animations**: 애니메이션 효과
6. **Responsive**: 반응형 스타일
7. **Pages**: 페이지별 특화 스타일

## 🚀 사용 방법

### 전체 스타일 사용
```css
@import './main.css';
```

### 특정 컴포넌트만 사용
```css
@import './components/buttons.css';
@import './components/tables.css';
```

### 새 페이지 스타일 추가
1. `pages/` 폴더에 새 페이지 폴더 생성
2. 해당 폴더에 페이지별 CSS 파일들 생성
3. `main.css`에 import 경로 추가

## 📈 향후 확장 계획

- **themes/**: 다크모드, 컬러 테마 등
- **utilities/**: 유틸리티 클래스들
- **vendor/**: 외부 라이브러리 스타일
- **print/**: 인쇄용 스타일
- **rtl/**: RTL(오른쪽에서 왼쪽) 언어 지원

## 🔧 유지보수 가이드

1. **스타일 수정**: 해당 기능의 CSS 파일만 수정
2. **새 컴포넌트**: `components/` 폴더에 추가
3. **페이지별 스타일**: `pages/페이지명/` 폴더에 추가
4. **반응형 수정**: `responsive/` 폴더의 해당 파일 수정
5. **애니메이션 추가**: `animations/` 폴더에 추가

이 구조를 통해 CSS 코드의 유지보수성, 재사용성, 확장성을 크게 향상시킬 수 있습니다.
