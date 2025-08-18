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

# 새로운 작업 내역은 아래에 추가
