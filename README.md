# Employee Management System Frontend

Vue.js 3 기반의 직원 관리 프론트엔드입니다.

## 주요 기능
- 직원 목록/상세/검색/필터/정렬/평가/성장 트렌드 시각화
- 관리자/리더/직원 권한별 기능 분리
- 실시간 알림, 토스트 메시지, 에러/로딩 UX 통일
- API 에러 메시지 구체화, 로깅, 보안 강화

## 폴더 구조
```
employee-management/
├── src/            # 프론트엔드 소스(Vue 3)
│   ├── components/ # 공통/직원 컴포넌트
│   ├── views/      # 페이지 컴포넌트
│   ├── models/     # 데이터 모델
│   ├── viewmodels/ # MVVM 뷰모델
│   ├── services/   # API 서비스
│   ├── store/      # Vuex 스토어
│   ├── router/     # 라우터
│   ├── assets/     # 정적 자원
├── public/         # 정적 파일(HTML, favicon 등)
├── backend/        # 백엔드(Node.js/Express)
├── docs/           # 문서
├── package.json    # 프론트엔드 의존성/스크립트
```

## 설치 및 실행
```bash
cd employee-management
npm install
npm run serve
```

## 환경변수(.env)
- API 주소, 환경 구분 등은 .env로 관리
- 예시:
```
VUE_APP_API_BASE_URL=http://localhost:3000/api
VUE_APP_ENVIRONMENT=development
```

## 참고
- 전체 프로젝트 구조/운영: `/PROJECT_OVERVIEW.md`
- 백엔드 API: `/employee-management/backend/README.md`
- DB/배포/운영: `/DATABASE_SETUP.md`, `/nginx-1.20.2/`, `/scripts/`
