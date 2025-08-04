<template>
  <div class="employee-form">
    <h2>{{ isEdit ? '직원 정보 수정' : '신규 직원 등록' }}</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>이름</label>
        <input type="text" v-model="form.name" required>
      </div>
      <div class="form-group">
        <label>부서</label>
        <input type="text" v-model="form.department" required>
      </div>
      <div class="form-group">
        <label>직급</label>
        <input type="text" v-model="form.position" required>
      </div>
      <div class="form-group">
        <label>입사일</label>
        <input type="date" v-model="form.joinDate" required>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">
          {{ isEdit ? '수정' : '등록' }}
        </button>
        <button type="button" class="btn" @click="$emit('cancel')">
          취소
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'EmployeeForm',
  props: {
    employee: {
      type: Object,
      default: () => ({
        name: '',
        department: '',
        position: '',
        joinDate: ''
      })
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: { ...this.employee }
    }
  },
  methods: {
    handleSubmit() {
      this.$emit('submit', { ...this.form })
    }
  }
}
</script>

<style scoped>
.employee-form {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
</style>