# Animations CSS

애니메이션 및 트랜지션 효과 관련 스타일들을 모아놓은 폴더입니다.

## 파일 설명

### transitions.css
- **용도**: 페이지 전환 효과 및 인터랙션 애니메이션
- **사용 페이지**: 
  - EmployeeList.vue (테이블 행 애니메이션, 페이드인 효과)
  - 향후 다른 페이지에서도 재사용 가능
- **포함 애니메이션**: 
  - fadeIn: 요소가 부드럽게 나타나는 효과
  - shimmer: 로딩 시 반짝임 효과
  - slideIn: 슬라이드 인 효과
  - 버튼 호버 효과
  - 정렬 헤더 애니메이션
  - 검색 입력 포커스 효과

## 향후 계획

다른 애니메이션 파일들을 추가할 예정입니다:

- **keyframes.css**: 복잡한 키프레임 애니메이션
- **loading.css**: 로딩 관련 애니메이션
- **modal.css**: 모달 창 애니메이션
- **notifications.css**: 알림 애니메이션

## 주요 애니메이션

### fadeIn
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### shimmer (로딩 효과)
```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

## 사용 방법

애니메이션은 전역적으로 적용되며, 각 컴포넌트에서 클래스를 추가하여 사용합니다.

```css
.my-element {
  animation: fadeIn 0.8s ease-in-out;
}
```
