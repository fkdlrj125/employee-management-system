<template>
  <div class="filter-controls">
    <div class="filter-group">
      <label>부서:</label>
      <select v-model="filters.department" @change="$emit('update:filters', { ...filters })">
        <option value="">전체 부서</option>
        <option value="DSS1">DSS1</option>
        <option value="DSS2">DSS2</option>
        <option value="CSC">CSC</option>
        <option value="HR">HR</option>
      </select>
    </div>
    <div class="filter-group">
      <label>직급:</label>
      <select v-model="filters.position" @change="$emit('update:filters', { ...filters })">
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
import Button from '../common/Button.vue';
const props = defineProps({
  filters: { type: Object, required: true },
});
const emit = defineEmits(['update:filters', 'clear']);
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
