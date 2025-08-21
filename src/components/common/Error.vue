<template>
  <div class="error-cell">
    <i class="fas fa-exclamation-triangle"></i> {{ message }}
  </div>
</template>
<script setup>
const props = defineProps({
  message: { type: String, default: '오류가 발생했습니다.' }
});
</script>
<style scoped>
.error-cell {
  text-align: center;
  padding: 24px;
  color: #d32f2f;
  font-size: 18px;
}
</style>
