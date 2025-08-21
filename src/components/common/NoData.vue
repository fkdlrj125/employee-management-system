<template>
  <div class="no-data-cell">
    <i class="fas fa-info-circle"></i> {{ message }}
  </div>
</template>
<script setup>
const props = defineProps({
  message: { type: String, default: '검색 결과가 없습니다.' }
});
</script>
<style scoped>
.no-data-cell {
  text-align: center;
  padding: 24px;
  color: #888;
  font-size: 17px;
}
</style>
