---
applyTo: '**/components/employee/detail/*.vue'
---

# 테이블 관리 버튼 UI/UX 개선 작업 가이드

## 목적
- 테이블의 행 이동/삭제 버튼(▲, ▼, 삭제)을 항상 노출하지 않고, **각 행의 마지막 <td>에 overlay로 배치**하며, **해당 행을 hover할 때만 노출**되도록 개선합니다.
- 기존 관리 열/셀(헤더/td, .manage-btns 등)은 제거하고, 레이아웃이 깨지지 않도록 신중하게 적용합니다.
- EducationTable.vue, CertificateTable.vue, CareerTable.vue, ProjectTable.vue 등 모든 employee detail 테이블에 동일한 패턴을 적용합니다.

## 작업 전 체크리스트
- [ ] 실제 파일 구조를 먼저 확인한다. (관리 열/셀, 버튼 위치, td 구조 등)
- [ ] 기존 관리 열/셀(.manage-th, .manage-td, .manage-btns 등) 코드를 제거한다.
- [ ] 각 행의 마지막 <td>에만 overlay로 아이콘 버튼(▲, ▼, 삭제)을 배치한다.
- [ ] hover 시에만 버튼이 노출되도록 CSS를 추가한다.
- [ ] 기존 버튼 로직(행 이동/삭제 등)은 그대로 연결한다.
- [ ] 레이아웃이 깨지지 않는지, 동작이 정상인지 반드시 검증한다.

## 예시 코드 패턴
```vue
<!-- 마지막 <td>에만 overlay로 버튼 배치 -->
<td style="position:relative;">
  ...
  <div v-if="editMode" class="row-action-btns action-btn-group">
    <button type="button" class="icon-btn" :disabled="index === 0" @click="moveUp(index)">
      <i class="fa fa-arrow-up"></i>
    </button>
    <button type="button" class="icon-btn" :disabled="index === items.length - 1" @click="moveDown(index)">
      <i class="fa fa-arrow-down"></i>
    </button>
    <button type="button" class="icon-btn delete" @click="showDeleteConfirm(index)">
      <i class="fa fa-trash"></i>
    </button>
  </div>
</td>
```

## CSS 예시
```css
.row-action-btns {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.18s;
  z-index: 2;
}
tr:hover .row-action-btns {
  opacity: 1;
}
.icon-btn {
  ...
}
```

## 주의사항
- 반드시 **실제 파일 구조를 먼저 확인**하고, 테이블 구조마다 overlay 위치와 CSS를 신중히 적용할 것
- 레이아웃이 깨지지 않도록, 기존 구조를 최대한 보존하며 적용할 것
- 적용 후에는 동작 및 레이아웃을 꼼꼼히 검증할 것

---

> 이 가이드는 employee detail 테이블 관리 버튼 UI/UX 개선 작업 시 반드시 참고해야 합니다. 수정 전 항상 실제 파일 구조를 확인하고, 위 체크리스트를 따라 신중하게 작업하세요.
