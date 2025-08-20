# 작업 내역 기록 예시

## feat: 경력사항 및 상세페이지 총 경력 계산 개선
- CareerTable.vue: 근무기간 개월수 자동 계산 및 UI 표시
- EmployeeDetail.vue: mitmas 총경력, 경력사항 개월수 computed로 분리
- EmployeeBasicInfo.vue: 총 경력(개월) prop 기반으로 합산 표시, 불필요한 계산 로직 제거
- 서브테이블 데이터 검증 함수(isSubTableEmpty) 추가 및 저장 조건 개선
- 코드 구조 및 반응성 개선, 불필요한 코드 정리

---

## feat: 개발환경 설정 및 Windows Server 2008 R2 배포 준비
- vue.config.js 수정: defineConfig 제거, transpileDependencies 배열로 변경
- package-lock.json 업데이트: legacy-peer-deps로 의존성 설치
- Docker 설정 추가: Windows Server 2008 R2 호환용 Dockerfile
- 배포 가이드 문서 추가: DEPLOY-2008R2.md
- 호환성 패키지 설정: package-2008r2.json

---

# 2025-08-18 작업 내역

## 프론트엔드
- 평가 저장 시 멤버/리더 API 분기 및 payload 구조 통일
- saveLeaderSkillScores, saveSkillScores 호출 방식 및 파라미터 정리
- employee_id를 url 파라미터로만 전달하도록 통일

## 백엔드
- DTO(EvaluationDTO, LeaderEvaluationDTO)에서 employee_id로 받을 수 있도록 생성자 보정
- 컨트롤러(EvaluationController)에서 payload 생성 시 employee_id로 통일
- DAO(EvaluationDAO, LeaderEvaluationDAO)에서 employeeId → employee_id로 변수명 통일 및 모든 내부 함수에서 employee_id만 사용
- LeaderEvaluationDAO를 EvaluationDAO와 동일한 구조(create, update, upsert)로 리팩토링

## 버그 수정
- employee_id undefined, leaderSkillScores undefined 등 주요 오류 해결
- 프론트-백엔드 데이터 흐름 및 변수명 일관성 확보

## 전체 흐름
1. 프론트에서 평가 저장 시 API 분기 및 파라미터 정리
2. 백엔드에서 DTO/컨트롤러/DAO/서비스/모델 전체 employee_id로 통일
3. DAO 구조 통일 및 special_note, evaluated_by 등 부가 정보 처리 일관화
4. 주요 오류(ReferenceError, WHERE parameter undefined 등) 완전 해결

---

# 2025-08-19 작업 내역

## 프론트엔드
- 로그인/비밀번호 변경 UI/UX 개선 및 스타일 통일
- 인라인 스타일 제거, CSS 클래스화
- 비밀번호 변경 모달창 구현 및 입력값 기반 부서 추출
- 관리자(admin) 계정 예외 처리 및 버튼 비활성화
- 비밀번호 변경 요청 시 메일 전송 링크 포함(/reset-password?token=...)
- 비밀번호 재설정 페이지(ResetPassword.vue) 추가 및 라우터 등록
- 비밀번호 확인 입력란 추가, 일치 여부 검증 및 UI 개선

## 백엔드
- 비밀번호 변경 요청 API(/api/auth/request-password-change) 구현
- nodemailer 환경변수(.env) 적용 및 보안 강화
- 메일 본문에 비밀번호 변경 링크 포함(토큰 기반)
- 비밀번호 변경 토큰 검증 API(/api/auth/verify-reset-token) 추가
- 비밀번호 재설정 API(/api/auth/reset-password) 추가(JWT 검증, 해시 저장)
- DB 연동 비밀번호 변경 처리

## 보안/환경
- .env 파일에 EMAIL_USER, EMAIL_PASS 환경변수 추가 및 gitignore 관리
- 로컬 테스트를 위한 메일 링크 주소 http://localhost:포트/reset-password?token=...로 변경 안내
- Gmail SMTP 앱 비밀번호 발급 및 적용 가이드 제공

## 전체 흐름
1. 로그인/비밀번호 변경 UI/UX 개선 및 예외 처리
2. 비밀번호 변경 요청 시 관리자에게 메일 전송 및 링크 포함
3. 메일 링크 클릭 시 토큰 검증 및 비밀번호 재설정
4. 프론트/백엔드/환경변수/보안 전체 플로우 구현 및 테스트

---

## 프론트엔드 리팩토링 내역
- 로그인 페이지 스타일 통일 및 레이아웃 개선
- 인라인 스타일 제거, 모든 스타일을 CSS 클래스/스타일 태그로 이전
- 버튼/입력창/박스 크기 및 정렬 개선, 자연스러운 UI 배치
- 불필요한 테스트 계정/요소 제거, UI 구조 단순화
- 모달창 구조 개선(v-if, z-index, overlay, box-shadow 등)
- 이벤트 바인딩 및 methods/computed 구조 정리
- 부서 자동 추출 로직 개선(아이디 입력 기반)
- 관리자(admin) 계정 예외 처리 및 UI 반영
- 비밀번호 변경 모달창 UX 개선(입력값 예외, 버튼 비활성화 등)
- 공통 CSS 및 컴포넌트 구조 정리, 코드 중복 제거
- 전체 페이지 스타일 일관성 확보 및 유지보수성 향상

---

# 새로운 작업 내역은 아래에 추가

## 2025-08-20 작업 내역

### 백엔드
- 직원 생성/수정 시 실제 SQL 쿼리 로그 출력 (Sequelize logging 옵션 적용)
- EmployeeDAO.js에서 트랜잭션, insert 데이터, 반환값, 에러 객체 등 모든 주요 데이터 로그 출력
- 직원 생성 시 관계 테이블(교육, 경력, 자격증, 외부 프로젝트) insert도 SQL 쿼리 로그 출력
- 직원 생성 후 findById에서 관계 테이블에 데이터가 없어도 직원 row가 반환되도록 include 옵션에 required: false 명시적으로 추가
- Sequelize 모델 관계 및 as 옵션, 트랜잭션 내 조회 동작 최신 사례 인터넷 검색 및 적용
- API insert 실패 원인 진단 및 해결: include required: false 옵션으로 null 반환 문제 해결

### 전체 흐름
1. 직원 생성/수정 시 모든 DB 작업 SQL 쿼리 및 데이터 로그 출력
2. 관계 테이블에 데이터가 없어도 직원 row가 반환되도록 include 옵션 개선
3. API insert 실패 원인 진단 및 최신 사례 반영
4. 문제 해결 후 정상적으로 직원 생성/조회 동작 확인

---
