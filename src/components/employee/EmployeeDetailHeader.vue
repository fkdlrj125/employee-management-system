<template>
  <div class="search-employee-bar">
    <div class="employee-bar-left">
      <router-link to="/employee-list" class="home-btn" title="메인으로">
        <i class="fas fa-home"></i>
      </router-link>
      <div class="search-group">
        <input
          type="text"
          v-model="searchName"
          placeholder="직원명 검색..."
          @keyup.enter="$emit('search', searchName)"
          class="search-input"
        />
        <button class="btn btn-primary" @click="$emit('search', searchName)">
          <i class="fas fa-search"></i> 검색
        </button>
      </div>
      <div v-if="searchError" class="error-message">{{ searchError }}</div>

      <div class="employee-btn-group">
        <button v-if="!editMode" class="btn btn-primary" @click="$emit('toggle-edit')">
          <i class="fas fa-edit"></i> {{ isAddMode ? '작성' : '수정' }}
        </button>
        <button v-if="editMode" class="btn btn-primary" @click="$emit('save')">
          <i class="fas fa-save"></i> 저장
        </button>
        <button v-if="editMode" class="btn btn-secondary" @click="$emit('cancel-edit')">
          <i class="fas fa-times"></i> 취소
        </button>
      </div>
    </div>

    <div class="user-action-bar">
      <span class="user-name">{{ currentUser?.username }}님</span>
      <button class="btn btn-secondary" @click="$emit('logout')">로그아웃</button>
      <button v-if="!isAddMode" class="btn btn-danger delete-detail-btn" @click="$emit('delete')">
        <i class="fas fa-trash"></i> 삭제
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmployeeDetailHeader',
  props: {
    editMode: {
      type: Boolean,
      default: false,
    },
    isAddMode: {
      type: Boolean,
      default: false,
    },
    currentUser: {
      type: Object,
      default: null,
    },
    searchError: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      searchName: '',
    };
  },
  emits: ['search', 'toggle-edit', 'save', 'cancel-edit', 'logout', 'delete'],
};
</script>

<style scoped>
.search-employee-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.employee-bar-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
}

.employee-btn-group {
  display: flex;
  gap: 8px;
}

.user-action-bar {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-name {
  font-weight: 500;
}

.home-btn {
  background-color: #28a745;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.9;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
}
</style>
