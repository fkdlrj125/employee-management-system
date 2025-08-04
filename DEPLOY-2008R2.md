# Windows Server 2008 R2 배포 가이드

## 문제점
- Windows Server 2008 R2는 최신 Node.js/npm 버전 미지원
- 많은 보안 취약점이 있는 레거시 의존성 사용 필요

## 해결 방안

### 1. Docker 사용 (권장)
```bash
# Docker 설치 (Windows Server 2008 R2 지원 버전)
# Docker Toolbox 사용

# 이미지 빌드
docker build -f Dockerfile.2008r2 -t employee-management-system .

# 컨테이너 실행
docker run -p 8080:8080 employee-management-system
```

### 2. 네이티브 설치 (제한적)
```bash
# Node.js 12.x 설치 (최대 지원 버전)
# npm 6.x 사용

# 호환 버전으로 패키지 설치
npm install --legacy-peer-deps
```

### 3. 보안 고려사항
- 방화벽으로 외부 접근 제한
- HTTPS 프록시 서버 사용 (IIS ARR 등)
- 정기적인 보안 패치 적용 (가능한 범위 내)
- 애플리케이션 레벨에서 입력 검증 강화

### 4. 모니터링
- Windows 이벤트 로그 모니터링
- 애플리케이션 로그 분석
- 성능 카운터 확인

## 장기 계획
- Windows Server 2019/2022로 마이그레이션 검토
- 클라우드 서비스 활용 고려
