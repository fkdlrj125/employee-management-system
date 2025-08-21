# Employee Management System Backend

Node.js/Express 기반 REST API 서버입니다.

## 주요 기능
- 직원 정보 CRUD
- 평가/리더 평가/성장 트렌드 API
- 인증(JWT), 파일 업로드(Multer), DB(MySQL, Sequelize)
- 에러 핸들러, 로깅, 미들웨어, 보안(Helmet, Rate Limit)

## 폴더 구조
```
backend/
├── app.js                # 메인 서버 파일
├── config/               # 환경설정(DB, 시퀄라이즈 등)
├── controllers/          # API 컨트롤러
├── dao/                  # DB 접근 객체
├── db/                   # DB 연결
├── dto/                  # 데이터 전송 객체
├── middlewares/          # 인증, 에러, 로깅 등 미들웨어
├── models/               # DB 모델
├── routes/               # API 라우트
├── services/             # 비즈니스 로직
├── uploads/              # 파일 업로드 디렉토리
├── utils/                # 유틸리티
└── package.json          # 백엔드 의존성/스크립트
```

## 설치 및 실행
```bash
cd backend
npm install
cp .env.example .env # 환경변수 파일 생성 및 설정
npm run dev          # 개발 서버 실행
npm start            # 프로덕션 서버 실행
```

## 환경변수(.env)
- DB, JWT, SMTP 등 민감 정보는 .env로 관리
- 예시:
```
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=employee_db
JWT_SECRET=your_jwt_secret
```

## 테스트
```bash
npm test
```

## 참고
- DB 스키마: `/database_schema.sql`
- DB 백업: `/backup_db/`
- 운영/배포 스크립트: `/scripts/`
- 전체 프로젝트 구조/운영: `/PROJECT_OVERVIEW.md`
