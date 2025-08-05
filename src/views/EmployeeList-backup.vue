<template>
  <div class="employee-list-container">
    <!-- 헤더 섹션 -->
    <div class="header-section">
      <h1>직원 목록</h1>
      <div class="header-actions">
        <div class="user-info">
          <span class="user-name">{{ currentUser?.username }}님</span>
          <button @click="logout" class="btn btn-secondary">로그아웃</button>
        </div>
        <button @click="refreshData" class="btn btn-refresh" title="새로고침">
          <i class="fas fa-sync-alt"></i> 새로고침
        </button>
        <button @click="navigateToDetail('new')" class="btn btn-primary">
          <i class="fas fa-plus"></i> 새 직원 등록
        </button>
      </div>
    </div>

    <!-- 검색 및 필터 섹션 -->
    <div class="search-filter-section">
      <div class="search-bar">
        <div class="search-input-group">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            @input="handleSearch"
            @keyup.enter="performSearch"
            placeholder="직원명, 이메일, 부서, 직급으로 검색..."
            class="search-input"
          />
          <button v-if="searchQuery" @click="clearSearch" class="clear-search">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <button @click="performSearch" class="btn btn-search">검색</button>
      </div>
      
      <div class="filter-controls">
        <div class="filter-group">
          <label>부서:</label>
          <select v-model="filters.department" @change="applyFilters">
            <option value="">전체 부서</option>
            <option value="DSS1">DSS1</option>
            <option value="DSS2">DSS2</option>
            <option value="CSC">CSC</option>
            <option value="HR">HR</option>
            <option value="IT">IT</option>
            <option value="Finance">Finance</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>직급:</label>
          <select v-model="filters.position" @change="applyFilters">
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
        
        <button @click="clearFilters" class="btn btn-secondary">필터 초기화</button>
      </div>
    </div>

    <!-- 직원 목록 테이블 -->
    <div class="table-container">
      <table class="employee-table">
        <thead>
          <tr>
            <th>번호</th>
            <th class="sortable" @click="sortByColumn('name')">
              이름 <i :class="getSortIcon('name')"></i>
            </th>
            <th class="sortable" @click="sortByColumn('department')">
              부서 <i :class="getSortIcon('department')"></i>
            </th>
            <th class="sortable" @click="sortByColumn('workplace')">
              근무지 <i :class="getSortIcon('workplace')"></i>
            </th>
            <th class="sortable" @click="sortByColumn('position')">
              직급 <i :class="getSortIcon('position')"></i>
            </th>
            <th class="sortable" @click="sortByColumn('hire_date')">
              입사일 <i :class="getSortIcon('hire_date')"></i>
            </th>
            <th>주소</th>
            <th class="sortable" @click="sortByColumn('total_score')">
              통합 평가 점수 <i :class="getSortIcon('total_score')"></i>
            </th>
            <th class="sortable" @click="sortByColumn('mitmas_total_career')">
              MITMAS 경력 <i :class="getSortIcon('mitmas_total_career')"></i>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="9" class="loading-cell">
              <i class="fas fa-spinner fa-spin"></i> 로딩 중...
            </td>
          </tr>
          <tr v-else-if="filteredEmployees.length === 0">
            <td colspan="9" class="no-data-cell">
              검색 결과가 없습니다.
            </td>
          </tr>
          <tr 
            v-else 
            v-for="(employee, index) in paginatedEmployees" 
            :key="employee.id"
            @click="navigateToDetail(employee.id)"
            :class="['employee-row', getDepartmentClass(employee.department)]"
          >
            <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
            <td>{{ employee.name }}</td>
            <td>
              <span :class="['department-badge', getDepartmentClass(employee.department)]">
                {{ employee.department }}
              </span>
            </td>
            <td>{{ employee.workplace }}</td>
            <td>
              <span :class="['position-badge', getPositionClass(employee.position)]">
                {{ employee.position }}
              </span>
            </td>
            <td>{{ formatDate(employee.hire_date) }}</td>
            <td>{{ employee.address || '-' }}</td>
            <td>{{ employee.total_score || '-' }}</td>
            <td>{{ formatCareer(employee.mitmas_total_career) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 모바일 카드 컨테이너 -->
    <div class="mobile-card-container">
      <div v-if="loading" class="loading-card">
        <i class="fas fa-spinner fa-spin"></i> 로딩 중...
      </div>
      <div v-else-if="filteredEmployees.length === 0" class="no-data-card">
        검색 결과가 없습니다.
      </div>
      <div 
        v-else
        v-for="(employee, index) in paginatedEmployees" 
        :key="employee.id"
        class="employee-card"
        :class="getDepartmentCardClass(employee.department)"
        @click="navigateToDetail(employee.id)"
      >
        <div class="employee-card-header">
          <div class="employee-card-name">{{ employee.name }}</div>
          <div class="employee-card-badges">
            <span :class="['department-badge', getDepartmentClass(employee.department)]">
              {{ employee.department }}
            </span>
            <span :class="['position-badge', getPositionClass(employee.position)]">
              {{ employee.position }}
            </span>
          </div>
        </div>
        <div class="employee-card-info">
          <div class="employee-card-item">
            <span class="employee-card-label">번호</span>
            <span class="employee-card-value">{{ (currentPage - 1) * pageSize + index + 1 }}</span>
          </div>
          <div class="employee-card-item">
            <span class="employee-card-label">근무지</span>
            <span class="employee-card-value">{{ employee.workplace }}</span>
          </div>
          <div class="employee-card-item">
            <span class="employee-card-label">입사일</span>
            <span class="employee-card-value">{{ formatDate(employee.hire_date) }}</span>
          </div>
          <div class="employee-card-item">
            <span class="employee-card-label">평가점수</span>
            <span class="employee-card-value">{{ employee.total_score || '-' }}</span>
          </div>
          <div class="employee-card-item">
            <span class="employee-card-label">MITMAS 경력</span>
            <span class="employee-card-value">{{ formatCareer(employee.mitmas_total_career) }}</span>
          </div>
          <div class="employee-card-item" v-if="employee.address">
            <span class="employee-card-label">주소</span>
            <span class="employee-card-value">{{ employee.address }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 페이지네이션 -->
    <div class="pagination-container" v-if="totalPages > 1">
      <button 
        @click="changePage(currentPage - 1)" 
        :disabled="currentPage === 1"
        class="btn btn-pagination"
      >
        이전
      </button>
      
      <button 
        v-for="page in visiblePages" 
        :key="page"
        @click="changePage(page)"
        :class="['btn', 'btn-pagination', { 'active': page === currentPage }]"
      >
        {{ page }}
      </button>
      
      <button 
        @click="changePage(currentPage + 1)" 
        :disabled="currentPage === totalPages"
        class="btn btn-pagination"
      >
        다음
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'EmployeeList',
  data() {
    return {
      searchQuery: '',
      filters: {
        department: '',
        position: '',
        search: ''
      },
      currentPage: 1,
      pageSize: 10,
      loading: false,
      searchTimeout: null,
      sortBy: '',
      sortOrder: 'asc' // 'asc' or 'desc'
    }
  },
  computed: {
    ...mapGetters('auth', ['currentUser']),
    ...mapGetters('employee', ['allEmployees', 'totalItems']),
    
    filteredEmployees() {
      let employees = [...this.allEmployees]
      
      // 검색 필터 적용
      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase()
        employees = employees.filter(employee => 
          employee.name?.toLowerCase().includes(searchTerm) ||
          employee.email?.toLowerCase().includes(searchTerm) ||
          employee.department?.toLowerCase().includes(searchTerm) ||
          employee.position?.toLowerCase().includes(searchTerm)
        )
      }
      
      // 부서 필터 적용
      if (this.filters.department) {
        employees = employees.filter(employee => 
          employee.department === this.filters.department
        )
      }
      
      // 직급 필터 적용
      if (this.filters.position) {
        employees = employees.filter(employee => 
          employee.position === this.filters.position
        )
      }
      
      // 정렬 적용
      if (this.sortBy) {
        employees.sort((a, b) => {
          let aVal = a[this.sortBy]
          let bVal = b[this.sortBy]
          
          // 직급 필드 특별 처리 (DB 저장 순서대로)
          if (this.sortBy === 'position') {
            const positionOrder = [
              '사원', '대리', '과장', '차장', '부장', '실장', '본부장', '이사', '부사장', '사장'
            ]
            const aIndex = positionOrder.indexOf(aVal)
            const bIndex = positionOrder.indexOf(bVal)
            
            // 순서가 정의되지 않은 직급은 맨 끝으로
            const aOrder = aIndex === -1 ? 999 : aIndex
            const bOrder = bIndex === -1 ? 999 : bIndex
            
            if (aOrder < bOrder) return this.sortOrder === 'asc' ? -1 : 1
            if (aOrder > bOrder) return this.sortOrder === 'asc' ? 1 : -1
            return 0
          }
          
          // 날짜 필드 처리
          if (this.sortBy === 'hire_date') {
            aVal = new Date(aVal || 0)
            bVal = new Date(bVal || 0)
          }
          
          // 숫자 필드 처리
          if (this.sortBy === 'total_score' || this.sortBy === 'mitmas_total_career') {
            aVal = parseFloat(aVal || 0)
            bVal = parseFloat(bVal || 0)
          }
          
          // 문자열 필드 처리
          if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase()
            bVal = bVal.toLowerCase()
          }
          
          if (aVal < bVal) return this.sortOrder === 'asc' ? -1 : 1
          if (aVal > bVal) return this.sortOrder === 'asc' ? 1 : -1
          return 0
        })
      }
      
      return employees
    },
    
    paginatedEmployees() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredEmployees.slice(start, end)
    },
    
    totalPages() {
      return Math.ceil(this.filteredEmployees.length / this.pageSize)
    },
    
    visiblePages() {
      const pages = []
      const start = Math.max(1, this.currentPage - 2)
      const end = Math.min(this.totalPages, this.currentPage + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    }
  },
  async created() {
    await this.loadEmployees()
  },
  beforeDestroy() {
    // 컴포넌트 파괴 시 타이머 정리
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  },
  methods: {
    ...mapActions('employee', ['fetchEmployees']),
    ...mapActions('auth', ['logout']),
    
    async loadEmployees() {
      this.loading = true
      try {
        await this.fetchEmployees()
      } catch (error) {
        console.error('직원 목록 로드 실패:', error)
        alert('직원 목록을 불러오는데 실패했습니다.')
      } finally {
        this.loading = false
      }
    },
    
    async refreshData() {
      await this.loadEmployees()
      alert('데이터가 새로고침되었습니다.')
    },
    
    handleSearch() {
      // 디바운싱을 위해 기존 타이머 클리어
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      
      // 500ms 후에 검색 실행
      this.searchTimeout = setTimeout(() => {
        this.filters.search = this.searchQuery
        this.currentPage = 1
      }, 500)
    },
    
    performSearch() {
      this.filters.search = this.searchQuery
      this.currentPage = 1
    },
    
    clearSearch() {
      this.searchQuery = ''
      this.filters.search = ''
      this.currentPage = 1
      
      // 타이머도 클리어
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
    },
    
    sortByColumn(field) {
      if (this.sortBy === field) {
        // 같은 필드 클릭 시 정렬 순서 변경
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        // 다른 필드 클릭 시 새로운 필드로 오름차순 정렬
        this.sortBy = field
        this.sortOrder = 'asc'
      }
      this.currentPage = 1
    },
    
    getSortIcon(field) {
      if (this.sortBy !== field) return 'fas fa-sort'
      return this.sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'
    },
    
    applyFilters() {
      this.currentPage = 1
    },
    
    clearFilters() {
      this.filters = {
        department: '',
        position: '',
        search: ''
      }
      this.searchQuery = ''
      this.currentPage = 1
      this.sortBy = ''
      this.sortOrder = 'asc'
      
      // 타이머도 클리어
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
    },
    
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    
    navigateToDetail(id) {
      if (id === 'new') {
        this.$router.push('/employee-detail/new')
      } else {
        this.$router.push(`/employee-detail/${id}`)
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString('ko-KR')
    },
    
    formatCareer(months) {
      if (!months || months === 0) return '0개월'
      
      const years = Math.floor(months / 12)
      const remainingMonths = months % 12
      
      let result = ''
      if (years > 0) {
        result += `${years}년`
      }
      if (remainingMonths > 0) {
        if (result) result += ' '
        result += `${remainingMonths}개월`
      }
      
      return result || '0개월'
    },
    
    getDepartmentClass(department) {
      switch (department) {
        case 'DSS1':
          return 'dept-dss1'
        case 'DSS2':
          return 'dept-dss2'
        case 'CSC':
          return 'dept-csc'
        case 'HR':
          return 'dept-hr'
        case 'IT':
          return 'dept-it'
        case 'Finance':
          return 'dept-finance'
        default:
          return 'dept-default'
      }
    },
    
    getPositionClass(position) {
      switch (position) {
        case '사원':
          return 'pos-junior'
        case '대리':
          return 'pos-associate'
        case '과장':
          return 'pos-manager'
        case '차장':
          return 'pos-deputy'
        case '부장':
          return 'pos-director'
        case '실장':
          return 'pos-head'
        case '본부장':
          return 'pos-division'
        case '이사':
          return 'pos-executive'
        case '부사장':
          return 'pos-vp'
        case '사장':
          return 'pos-president'
        default:
          return 'pos-default'
      }
    },
    
    getDepartmentCardClass(department) {
      switch (department) {
        case 'DSS1':
          return 'dept-dss1'
        case 'DSS2':
          return 'dept-dss2'
        case 'CSC':
          return 'dept-csc'
        case 'HR':
          return 'dept-hr'
        case 'IT':
          return 'dept-it'
        case 'Finance':
          return 'dept-finance'
        default:
          return 'dept-default'
      }
    }
  }
}
</script>

<style>
/* 외부 CSS 파일 import */
@import '@/assets/css/common.css';
@import '@/assets/css/table.css';
@import '@/assets/css/employee-list.css';
</style>

<style scoped>
/* 이 컴포넌트에만 특별히 필요한 스타일만 작성 */
.employee-list-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* 특별한 커스터마이징이 필요한 경우에만 추가 */


.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-section h1 {
  color: #2c3e50;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  color: #495057;
  font-weight: 500;
}

.search-filter-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input-group {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-group i {
  position: absolute;
  left: 12px;
  color: #6c757d;
  z-index: 1;
}

.search-input {
  flex: 1;
  padding: 12px 40px 12px 40px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.clear-search {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.clear-search:hover {
  background-color: #f8f9fa;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  color: #495057;
  white-space: nowrap;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  min-width: 120px;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.employee-table {
  width: 100%;
  border-collapse: collapse;
}

.employee-table th {
  background-color: #f8f9fa;
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
}

.employee-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
  position: relative;
}

.employee-table th.sortable:hover {
  background-color: #e9ecef;
}

.employee-table th.sortable i {
  margin-left: 8px;
  opacity: 0.5;
  font-size: 12px;
}

.employee-table th.sortable:hover i {
  opacity: 1;
}

.employee-table td {
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  vertical-align: middle;
}

.employee-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.employee-row:hover {
  background-color: #f8f9fa;
}

.employee-row:active {
  background-color: #e9ecef;
}

/* 부서별 행 색상 코딩 */
.employee-row.dept-dss1 {
  border-left: 4px solid #007bff;
}

.employee-row.dept-dss1:hover {
  border-left-width: 5px;
}

.employee-row.dept-dss2 {
  border-left: 4px solid #17a2b8;
}

.employee-row.dept-dss2:hover {
  border-left-width: 5px;
}

.employee-row.dept-csc {
  border-left: 4px solid #28a745;
}

.employee-row.dept-csc:hover {
  border-left-width: 5px;
}

.employee-row.dept-hr {
  border-left: 4px solid #dc3545;
}

.employee-row.dept-hr:hover {
  border-left-width: 5px;
}

.employee-row.dept-it {
  border-left: 4px solid #6610f2;
}

.employee-row.dept-it:hover {
  border-left-width: 5px;
}

.employee-row.dept-finance {
  border-left: 4px solid #fd7e14;
}

.employee-row.dept-finance:hover {
  border-left-width: 5px;
}

.employee-row.dept-default {
  border-left: 4px solid #6c757d;
}

.employee-row.dept-default:hover {
  border-left-width: 5px;
}

/* 부서 배지 스타일 */
.department-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  text-align: center;
  min-width: 50px;
}

.department-badge.dept-dss1 {
  background-color: #007bff;
}

.department-badge.dept-dss2 {
  background-color: #17a2b8;
}

.department-badge.dept-csc {
  background-color: #28a745;
}

.department-badge.dept-hr {
  background-color: #dc3545;
}

.department-badge.dept-it {
  background-color: #6610f2;
}

.department-badge.dept-finance {
  background-color: #fd7e14;
}

.department-badge.dept-default {
  background-color: #6c757d;
}

/* 직급 배지 스타일 */
.position-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  text-align: center;
  min-width: 40px;
  border: 1px solid;
}

/* 직급별 색상 - 그라데이션으로 계층 표현 */
.position-badge.pos-junior {
  background-color: #e3f2fd;
  color: #1976d2;
  border-color: #bbdefb;
}

.position-badge.pos-associate {
  background-color: #e8f5e8;
  color: #388e3c;
  border-color: #c8e6c9;
}

.position-badge.pos-manager {
  background-color: #fff3e0;
  color: #f57c00;
  border-color: #ffcc02;
}

.position-badge.pos-deputy {
  background-color: #fce4ec;
  color: #c2185b;
  border-color: #f8bbd9;
}

.position-badge.pos-director {
  background-color: #f3e5f5;
  color: #7b1fa2;
  border-color: #e1bee7;
}

.position-badge.pos-head {
  background-color: #e8eaf6;
  color: #303f9f;
  border-color: #c5cae9;
}

.position-badge.pos-division {
  background-color: #e0f2f1;
  color: #00695c;
  border-color: #b2dfdb;
}

.position-badge.pos-executive {
  background-color: #fff8e1;
  color: #ef6c00;
  border-color: #ffecb3;
}

.position-badge.pos-vp {
  background-color: #ffebee;
  color: #c62828;
  border-color: #ffcdd2;
}

.position-badge.pos-president {
  background-color: #1a1a1a;
  color: #ffd700;
  border-color: #333;
  font-weight: 600;
}

.position-badge.pos-default {
  background-color: #f5f5f5;
  color: #757575;
  border-color: #e0e0e0;
}

.loading-cell,
.no-data-cell {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
  font-style: italic;
}

.pagination-container {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-top: 20px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-refresh {
  background-color: #28a745;
  color: white;
}

.btn-refresh:hover {
  background-color: #218838;
}

.btn-search {
  background-color: #17a2b8;
  color: white;
  padding: 12px 20px;
}

.btn-search:hover {
  background-color: #138496;
}

.btn-pagination {
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  min-width: 40px;
}

.btn-pagination:hover:not(:disabled) {
  background-color: #e9ecef;
}

.btn-pagination.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 애니메이션 정의 - 차분하게 수정 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 로딩 애니메이션만 유지 */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 로딩 애니메이션 */
.loading-cell::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: shimmer 1.5s infinite;
}

/* 반응형 디자인 */
/* 반응형 개선 - 테이블 액션 버튼 */
@media (max-width: 1200px) {
  .employee-table .btn {
    padding: 4px 8px;
    font-size: 12px;
    margin: 1px;
  }
  
  .employee-table .btn i {
    font-size: 11px;
  }
  
  .employee-table .btn-sm {
    padding: 3px 6px;
  }
}

@media (max-width: 992px) {
  .employee-table th:nth-child(7), /* 주소 */
  .employee-table td:nth-child(7) {
    display: none;
  }
  
  .employee-table th:nth-child(8), /* 통합 평가 점수 */
  .employee-table td:nth-child(8) {
    font-size: 12px;
    padding: 8px 4px;
  }
}

@media (max-width: 768px) {
  /* 테이블을 모바일에서 숨김 */
  .table-container {
    display: none;
  }
  
  /* 페이지네이션 모바일 최적화 */
  .pagination-container {
    flex-wrap: wrap;
    justify-content: center;
    gap: 5px;
    padding: 0 10px;
  }
  
  .btn-pagination {
    min-width: 40px;
    padding: 8px 12px;
    font-size: 13px;
    margin: 2px;
  }
  
  .btn-pagination.active {
    background-color: #007bff;
    border-color: #007bff;
    color: white;
    font-weight: 600;
  }
}

/* 로딩 및 빈 데이터 스타일 개선 */
.loading-cell, .no-data-cell {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
  font-size: 16px;
  background: linear-gradient(45deg, #f8f9fa, #e9ecef);
}

.loading-cell i {
  font-size: 20px;
  margin-right: 10px;
  color: #007bff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 검색 및 필터 섹션 반응형 */
@media (max-width: 576px) {
  .search-filter-section {
    padding: 15px 10px;
    margin: 0 5px 15px 5px;
  }
  
  .search-bar {
    flex-direction: column;
    gap: 15px;
  }
  
  .search-input-group {
    width: 100%;
  }
  
  .filter-controls {
    flex-direction: column;
    gap: 15px;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .filter-group label {
    font-weight: 600;
    color: #495057;
  }
  
  .filter-group select {
    width: 100%;
    margin: 0;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #ced4da;
    font-size: 14px;
  }
  
  .results-info {
    font-size: 13px;
    text-align: center;
    margin-top: 10px;
  }
}

/* 헤더 섹션 반응형 개선 */
@media (max-width: 576px) {
  .header-section {
    padding: 15px 10px;
    margin: 0 5px 15px 5px;
  }
  
  .header-section h1 {
    font-size: 22px;
    margin-bottom: 0;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    gap: 10px;
  }
  
  .user-info {
    order: 1;
    width: 100%;
    justify-content: space-between;
    padding: 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }
  
  .user-name {
    font-size: 14px;
  }
  
  .btn-logout {
    order: 2;
    width: 100%;
    justify-content: center;
    padding: 10px;
  }
}

@media (max-width: 1200px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .search-filter-section {
    padding: 15px;
  }
  
  .employee-table th:nth-child(7), /* 주소 */
  .employee-table td:nth-child(7) {
    display: none;
  }
  
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .employee-table {
    min-width: 1000px;
  }
}

@media (max-width: 768px) {
  .employee-list-container {
    padding: 10px;
  }
  
  .header-section h1 {
    font-size: 20px;
  }
  
  .search-bar {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-input-group {
    width: 100%;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .filter-group {
    width: 100%;
    justify-content: space-between;
  }
  
  .filter-group select {
    min-width: 150px;
    flex: 1;
    margin-left: 10px;
  }
  
  /* 모바일에서 테이블 카드 형태로 변경 */
  .table-container {
    display: none;
  }
  
  .mobile-card-container {
    display: block;
  }
  
  .pagination-container {
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .btn-pagination {
    min-width: 35px;
    padding: 6px 8px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .employee-list-container {
    padding: 5px;
  }
  
  .header-section {
    padding: 15px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .user-info {
    order: 2;
  }
  
  .search-filter-section {
    padding: 10px;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-group select {
    width: 100%;
    margin-left: 0;
    margin-top: 5px;
  }
}

/* 모바일 카드 스타일 */
@media (max-width: 768px) {
  .mobile-card-container {
    display: block;
  }
  
  .loading-card, .no-data-card {
    background: white;
    border-radius: 12px;
    padding: 30px;
    text-align: center;
    color: #6c757d;
    font-size: 16px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .loading-card i {
    font-size: 20px;
    margin-right: 10px;
    color: #007bff;
  }
  
  .employee-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    border-left: 4px solid #007bff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: background-color 0.2s ease, box-shadow 0.2s ease;
    animation: fadeIn 0.8s ease-in-out;
  }
  
  .employee-card:hover {
    background-color: #f8f9fa;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .employee-card:active {
    background-color: #e9ecef;
  }
  
  .employee-card.dept-dss1 { border-left-color: #007bff; }
  .employee-card.dept-dss2 { border-left-color: #17a2b8; }
  .employee-card.dept-csc { border-left-color: #28a745; }
  .employee-card.dept-hr { border-left-color: #dc3545; }
  .employee-card.dept-it { border-left-color: #6610f2; }
  .employee-card.dept-finance { border-left-color: #fd7e14; }
  
  .employee-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .employee-card-name {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    flex: 1;
    min-width: 0;
  }
  
  .employee-card-badges {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  
  .employee-card-badges .department-badge,
  .employee-card-badges .position-badge {
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 12px;
    font-weight: 500;
  }
  
  .employee-card-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 15px;
    font-size: 14px;
  }
  
  .employee-card-item {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  
  .employee-card-label {
    font-size: 12px;
    color: #6c757d;
    margin-bottom: 3px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .employee-card-value {
    color: #495057;
    font-weight: 500;
    word-break: break-word;
    line-height: 1.3;
  }
  
  /* 주소가 있는 경우 전체 너비 사용 */
  .employee-card-item:last-child {
    grid-column: 1 / -1;
  }
}

@media (min-width: 769px) {
  .mobile-card-container {
    display: none;
  }
}

/* 카드 애니메이션 지연 효과 */
.employee-card:nth-child(1) { animation-delay: 0.1s; }
.employee-card:nth-child(2) { animation-delay: 0.15s; }
.employee-card:nth-child(3) { animation-delay: 0.2s; }
.employee-card:nth-child(4) { animation-delay: 0.25s; }
.employee-card:nth-child(5) { animation-delay: 0.3s; }

/* 부드러운 전환 효과 - 차분하게 수정 */
.table-container {
  animation: fadeIn 1s ease-in-out;
}

.employee-table tbody tr {
  animation: fadeIn 0.8s ease-out forwards;
  opacity: 0;
}

/* 순차 등장 간격을 더 짧게 */
.employee-table tbody tr:nth-child(1) { animation-delay: 0.05s; }
.employee-table tbody tr:nth-child(2) { animation-delay: 0.1s; }
.employee-table tbody tr:nth-child(3) { animation-delay: 0.15s; }
.employee-table tbody tr:nth-child(4) { animation-delay: 0.2s; }
.employee-table tbody tr:nth-child(5) { animation-delay: 0.25s; }
.employee-table tbody tr:nth-child(6) { animation-delay: 0.3s; }
.employee-table tbody tr:nth-child(7) { animation-delay: 0.35s; }
.employee-table tbody tr:nth-child(8) { animation-delay: 0.4s; }
.employee-table tbody tr:nth-child(9) { animation-delay: 0.45s; }
.employee-table tbody tr:nth-child(10) { animation-delay: 0.5s; }

/* 검색 입력 - 차분한 포커스 효과 */
.search-input {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input:focus {
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  border-color: #007bff;
}

/* 버튼 - 차분한 호버 효과 */
.btn {
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
}

.btn:active {
  opacity: 0.8;
  transition: opacity 0.1s ease;
}

/* 정렬 헤더 - 차분한 효과 */
.employee-table th.sortable {
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.employee-table th.sortable:hover {
  background-color: rgba(0, 123, 255, 0.1);
}

.employee-table th.sortable i {
  transition: color 0.2s ease;
}

.employee-table th.sortable:hover i {
  color: #007bff;
}

/* 페이지네이션 - 차분한 효과 */
.pagination-container {
  animation: fadeIn 0.8s ease-in-out;
}

.btn-pagination {
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.btn-pagination.active {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.btn-pagination:hover:not(.active):not(:disabled) {
  background-color: #e9ecef;
}

/* 배지 기본 스타일 */
.department-badge, .position-badge {
  transition: opacity 0.2s ease;
}

/* 접근성 및 포커스 개선 */
.btn:focus,
.search-input:focus,
select:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

/* 다크모드 호환성 준비 */
@media (prefers-color-scheme: dark) {
  .employee-list-container {
    background-color: #1a1a1a;
    color: #e9ecef;
  }
  
  .header-section,
  .search-filter-section {
    background: #2d2d2d;
    color: #e9ecef;
  }
  
  .employee-table {
    background: #2d2d2d;
    color: #e9ecef;
  }
  
  .employee-table th {
    background: #3a3a3a;
    border-color: #4a4a4a;
  }
  
  .employee-table td {
    border-color: #4a4a4a;
  }
  
  .employee-card {
    background: #2d2d2d;
    color: #e9ecef;
  }
}
</style>