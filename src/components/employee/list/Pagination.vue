<template>
  <div class="pagination-container">
    <Button :disabled="currentPage === 1" :btnClass="['pagination-btn']" @click="$emit('page-changed', 1)">
      <i class="fas fa-angle-double-left"></i>
    </Button>
    <Button :disabled="currentPage === 1" :btnClass="['pagination-btn']" @click="$emit('page-changed', currentPage - 1)">
      <i class="fas fa-angle-left"></i>
    </Button>
    <span class="pagination-info">
      <input
        type="text"
        :value="currentPage"
        @change="onInputPage"
        @keyup.enter="onInputPage"
        class="pagination-input"
        aria-label="페이지 번호 입력"
      />
      <span class="slash">/</span>
      <span class="total">{{ totalPages }}</span>
    </span>
    <Button :disabled="currentPage === totalPages" :btn-class="['pagination-btn']" @click="$emit('page-changed', currentPage + 1)">
      <i class="fas fa-angle-right"></i>
    </Button>
    <Button :disabled="currentPage === totalPages" :btn-class="['pagination-btn']" @click="$emit('page-changed', totalPages)">
      <i class="fas fa-angle-double-right"></i>
    </Button>
  </div>
</template>

<script>
import Button from '@/components/common/Button.vue';
export default {
  name: 'Pagination',
  components: { Button },
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    }
  },
  methods: {
    onInputPage(e) {
      let val = Number(e.target.value);
      if (!val || val < 1) val = 1;
      if (val > this.totalPages) val = this.totalPages;
      if (val !== this.currentPage) {
        this.$emit('page-changed', val);
      }
    }
  }
};
</script>

<style scoped>
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin: 16px 0;
}
.pagination-btn {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  padding: 0;
  margin: 0;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.pagination-btn:disabled {
  color: #aaa;
  background: #f5f5f5;
  cursor: not-allowed;
}
.pagination-btn:not(:disabled):hover {
  background: #f0f0f0;
  border-color: #bbb;
  color: #444;
}
.pagination-info {
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}
.pagination-input {
  border: 1.5px solid #ddd;
  border-radius: 8px;
  background: #fff;
  padding: 0 6px;
  font-size: 16px;
  width: 40px;
  height: 36px;
  margin-right: 0;
  text-align: center;
  font-weight: 600;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  vertical-align: middle;
}
.pagination-input:focus {
  border-color: #bbb;
  box-shadow: 0 0 0 2px #f0f0f0;
}
.pagination-info {
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 30px;
}
.pagination-info .slash,
.pagination-info .total {
  font-size: 16px;
  font-weight: 600;
  color: #444;
  text-align: center;
  vertical-align: middle;
  margin-left: 2px;
  margin-right: 0;
  line-height: 30px;
  background: none;
  border: none;
  padding: 0;
  min-width: 0;
  height: auto;
  box-sizing: border-box;
  display: inline;
}

.total {
  font-size: 18px !important;
}
</style>
