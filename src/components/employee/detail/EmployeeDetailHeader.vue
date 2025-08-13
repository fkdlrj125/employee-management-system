
<template>
  <div class="header-section">
    <div class="employee-bar-left">
      <slot name="left-extra"></slot>
      <router-link to="/employee-list" class="home-btn" title="메인으로">
        <i class="fas fa-home"></i>
      </router-link>
      <div class="search-group">
        <div class="autocomplete-wrapper">
          <CommonInput
            v-model="searchName"
            placeholder="직원명 검색..."
            input-class="search-input"
            @input="onSearchInput"
            @keydown.down.prevent="onArrowDown"
            @keydown.up.prevent="onArrowUp"
            @keydown.enter.prevent="onEnter"
            @focus="showDropdown = true"
            @blur="onBlur"
          />
          <Button btn-class="btn-primary" @click="onEnter"><i class="fas fa-search"></i>검색</Button>
          <ul v-if="showDropdown && filteredCandidates.length > 0" class="autocomplete-dropdown">
            <li v-for="(candidate, idx) in filteredCandidates"
                :key="candidate.id"
                :class="{ selected: idx === highlightedIndex }"
                @mousedown.prevent="selectCandidate(candidate)"
            >
              {{ candidate.name }} <span class="candidate-id">({{ candidate.id }})</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="employee-btn-group">
        <Button v-if="!editMode" btn-class="btn-primary" @click="$emit('toggle-edit')">
          <i class="fas fa-edit"></i> {{ isAddMode ? '작성' : '수정' }}
        </Button>
        <Button v-if="editMode" btn-class="btn-primary" @click="$emit('save')">
          <i class="fas fa-save"></i> 저장
        </Button>
        <Button v-if="editMode" btn-class="btn-secondary" @click="$emit('cancel-edit')">
          <i class="fas fa-times"></i> 취소
        </Button>
      </div>
    </div>
    <div v-if="searchError" class="error-message">{{ searchError }}</div>
    <div class="header-actions">
      <div class="user-info">
        <span class="user-name">{{ currentUser?.username }}님</span>
        <Button @click="$emit('logout')" btn-class="btn-secondary">로그아웃</Button>
      </div>
      <Button v-if="!isAddMode" btn-class="btn-danger delete-detail-btn" @click="$emit('delete')">
        <i class="fas fa-trash"></i> 삭제
      </Button>
    </div>
  </div>
</template>

<script>
import Button from '@/components/common/Button.vue';
import CommonInput from '@/components/common/CommonInput.vue';
 import EmployeeApiService from '@/services/employee-api-service';
export default {
  components: { Button, CommonInput },
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
      filteredCandidates: [],
      showDropdown: false,
      highlightedIndex: 0,
    };
  },
  emits: ['search', 'toggle-edit', 'save', 'cancel-edit', 'logout', 'delete'],
  methods: {
    async onSearchInput() {
      if (!this.searchName.trim()) {
        this.filteredCandidates = [];
        this.showDropdown = false;
        return;
      }
      const res = await EmployeeApiService.searchEmployeesByName(this.searchName.trim());
      if (res.success && res.data && res.data.length > 0) {
        this.filteredCandidates = res.data;
        this.showDropdown = true;
        this.highlightedIndex = 0;
      } else {
        this.filteredCandidates = [];
        this.showDropdown = false;
      }
    },
    onArrowDown() {
      if (!this.showDropdown || this.filteredCandidates.length === 0) return;
      this.highlightedIndex = (this.highlightedIndex + 1) % this.filteredCandidates.length;
    },
    onArrowUp() {
      if (!this.showDropdown || this.filteredCandidates.length === 0) return;
      this.highlightedIndex = (this.highlightedIndex - 1 + this.filteredCandidates.length) % this.filteredCandidates.length;
    },
    onEnter() {
      if (this.filteredCandidates.length > 0) {
        this.selectCandidate(this.filteredCandidates[this.highlightedIndex]);
      } else {
        this.$emit('search', this.searchName);
      }
    },
    selectCandidate(candidate) {
      this.showDropdown = false;
      this.searchName = '';
      this.filteredCandidates = [];
      this.$router.push(`/employee-detail/${candidate.id}`);
    },
    onBlur() {
      setTimeout(() => { this.showDropdown = false; }, 150);
    },
  },
};
</script>

<style scoped>
.autocomplete-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}
.autocomplete-dropdown {
  position: absolute;
  top: 38px;
  left: 0;
  width: 100%;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  z-index: 10;
  max-height: 220px;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
}
.autocomplete-dropdown li {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 15px;
  display: flex;
  align-items: center;
}
.autocomplete-dropdown li.selected,
.autocomplete-dropdown li:hover {
  background: #e9ecef;
}
.candidate-id {
  color: #888;
  font-size: 13px;
  margin-left: 8px;
}
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
  width: 180px;
  min-width: 0;
  height: 40px;
  box-sizing: border-box;
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
  height: 20px;
  padding: 8px 12px;
  border-radius: 4px;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
}
</style>

