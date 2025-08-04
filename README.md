# 직원관리시스템 (Employee Management System)

Vue.js와 Node.js 기반의 현대적인 직원관리시스템입니다.

## 🚀 주요 기능

- **직원 정보 관리**: 직원의 기본 정보, 학력, 자격증, 경력, 프로젝트 이력 관리
- **반응형 디자인**: 모든 디바이스에서 최적화된 사용자 경험
- **인증 시스템**: 로그인/로그아웃 기능
- **검색 및 필터링**: 부서, 직급, 이름으로 직원 검색
- **MVVM/MVC 아키텍처**: 프론트엔드 MVVM, 백엔드 MVC 패턴 적용

## 🛠️ 기술 스택

### 프론트엔드 (MVVM 패턴)
- **Vue.js 2.6.14**: 메인 프레임워크
- **Vue Router**: 라우팅 관리
- **Vuex**: 상태 관리
- **CSS3**: 스타일링

### 백엔드 (MVC 패턴)
- **Node.js**: 런타임 환경
- **Express.js**: 웹 프레임워크
- **MySQL**: 데이터베이스
- **JWT**: 인증
- **Multer**: 파일 업로드

## 📁 프로젝트 구조

```
employee-management/
├── src/                          # 프론트엔드 (Vue.js)
│   ├── components/               # 재사용 가능한 컴포넌트
│   │   └── employee/             # 직원 관련 컴포넌트
│   ├── views/                    # 페이지 컴포넌트
│   ├── models/                   # 데이터 모델 (MVVM)
│   ├── viewmodels/               # 뷰모델 (MVVM)
│   ├── services/                 # API 서비스
│   ├── store/                    # Vuex 스토어
│   ├── router/                   # 라우터 설정
│   └── assets/                   # 정적 자원
├── backend/                      # 백엔드 (Node.js)
│   ├── controllers/              # 컨트롤러 (MVC)
│   ├── models/                   # 모델 (MVC)
│   ├── routes/                   # 라우트 정의
│   ├── middlewares/              # 미들웨어
│   ├── config/                   # 설정 파일
│   └── app.js                    # 메인 서버 파일
└── public/                       # 정적 파일
```

## 🚀 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone https://github.com/YOUR_USERNAME/employee-management-system.git
cd employee-management-system
```

### 2. 프론트엔드 설정
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run serve

# 프로덕션 빌드
npm run build
```

### 3. 백엔드 설정
```bash
# 백엔드 디렉토리로 이동
cd backend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에서 데이터베이스 설정 등을 수정

# 개발 서버 실행
npm run dev

# 프로덕션 실행
npm start
```

## 🔧 환경 설정

### 프론트엔드 환경 변수 (.env)
```env
VUE_APP_API_BASE_URL=http://localhost:3000/api
VUE_APP_ENVIRONMENT=development
```

### 백엔드 환경 변수 (backend/.env)
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:8080

# 데이터베이스
DB_HOST=localhost
DB_PORT=3306
DB_NAME=employee_management
DB_USER=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=24h
```

## 📊 데이터베이스 스키마

주요 테이블:
- `employees`: 직원 기본 정보
- `educations`: 학력 정보
- `certificates`: 자격증 정보
- `careers`: 경력 정보
- `projects`: 프로젝트 이력

## 🎯 주요 기능

### 로그인 페이지
- 관리자 인증 시스템 (demo: admin/admin)
- 세션 관리

### 직원 목록
- 전체 직원 목록 조회
- 부서/직급별 필터링
- 검색 기능

### 직원 상세 정보
- 개인 정보 관리
- 학력, 자격증, 경력, 프로젝트 이력
- 수정/삭제 기능

## 🏗️ 아키텍처 패턴

### 프론트엔드 (MVVM)
- **Model**: 데이터 구조 및 비즈니스 규칙 (`src/models/`)
- **ViewModel**: 비즈니스 로직 및 상태 관리 (`src/viewmodels/`)
- **View**: UI 컴포넌트 (`src/views/`, `src/components/`)

### 백엔드 (MVC)
- **Model**: 데이터 접근 계층 (`backend/models/`)
- **View**: API 응답 형식 (JSON)
- **Controller**: 요청 처리 및 비즈니스 로직 (`backend/controllers/`)

## 🔄 API 엔드포인트

```
GET    /api/employees          # 직원 목록 조회
GET    /api/employees/:id      # 직원 상세 조회
POST   /api/employees          # 직원 생성
PUT    /api/employees/:id      # 직원 수정
DELETE /api/employees/:id      # 직원 삭제
```

## 🤝 기여 방법

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요!
