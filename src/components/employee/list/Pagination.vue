<template>
  <div class="pagination-container">
    <button
      class="pagination-btn"
      :disabled="currentPage === 1"
      @click="$emit('change', currentPage - 1)"
    >
      이전
    </button>
    <span class="pagination-info">
      {{ currentPage }} / {{ totalPages }}
    </span>
    <button
      class="pagination-btn"
      :disabled="currentPage === totalPages"
      @click="$emit('change', currentPage + 1)"
    >
      다음
    </button>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    }
  }
};
</script>

<style scoped>
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
}
.pagination-btn {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px 16px;
  margin: 0 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}
.pagination-btn:disabled {
  color: #aaa;
  background: #f5f5f5;
  cursor: not-allowed;
}
.pagination-info {
  font-size: 15px;
  font-weight: 500;
}
</style>
