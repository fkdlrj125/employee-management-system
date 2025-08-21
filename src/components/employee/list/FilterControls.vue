<template>
  <div class="filter-controls">
    <div class="filter-group">
      <label>부서:</label>
      <select v-model="localFilters.department" @change="onDepartmentChange">
        <option value="">전체 부서</option>
        <option value="DSS1">DSS1</option>
        <option value="DSS2">DSS2</option>
        <option value="CSC">CSC</option>
        <option value="HR">HR</option>
      </select>
    </div>
    <div class="filter-group">
      <label>직급:</label>
      <select v-model="localFilters.position" @change="onPositionChange">
        <option value="">전체 직급</option>
        <option value="사원">사원</option>
        <option value="대리">대리</option>
        <option value="과장">과장</option>
        <option value="차장">차장</option>
        <option value="부장">부장</option>
        <option value="실장">실장</option>
        <option value="본부장">본부장</option>
        <option value="이사">이사</option>
        <option value="부사장">부사장</option>
        <option value="사장">사장</option>
      </select>
    </div>
    <Button @click="$emit('clear')" btn-class="btn btn-secondary">필터 초기화</Button>
  </div>
</template>

<script setup>

import { ref, watch } from 'vue';
import Button from '@/components/common/Button.vue';
const props = defineProps({
  filters: { type: Object, required: true },
});
const emit = defineEmits(['update:filters', 'clear']);

const localFilters = ref({ ...props.filters });

watch(() => props.filters, (newVal) => {
  localFilters.value = { ...newVal };
});

function onDepartmentChange(e) {
  localFilters.value.department = e.target.value;
  emit('update:filters', { ...localFilters.value });
}
function onPositionChange(e) {
  localFilters.value.position = e.target.value;
  emit('update:filters', { ...localFilters.value });
}
</script>

<style scoped>
.filter-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
