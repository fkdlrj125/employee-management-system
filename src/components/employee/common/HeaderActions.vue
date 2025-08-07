// MOVE TO: src/components/employee/common/HeaderActions.vue
<template>
  <div class="header-actions">
    <div class="user-info">
      <span class="user-name">{{ currentUser?.username }}님</span>
      <Button @click="$emit('logout')" btn-class="btn btn-secondary">로그아웃</Button>
    </div>
    <Button @click="handleRefreshClick" btn-class="btn btn-refresh" title="새로고침">
      <i class="fas fa-sync-alt"></i> 새로고침
    </Button>
    <Button @click="$emit('add')" btn-class="btn btn-primary">
      <i class="fas fa-plus"></i> 새 직원 등록
    </Button>
  </div>
</template>

<script setup>
import Button from '@/components/common/Button.vue';
// import { onMounted } from 'vue';
const props = defineProps({
  currentUser: { type: Object, default: null },
});
const emit = defineEmits(['logout', 'refresh', 'add']);


function handleRefreshClick(e) {
  emit('refresh');
}
</script>

<style scoped>
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-name {
  font-weight: 500;
}
</style>
