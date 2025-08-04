<template>
  <div class="main-bg">
    <div class="container card">
      <!-- 헤더 -->
      <header class="header header-flex modern-header">
        <div class="header-title">
          <h1><i class="fas fa-users"></i> 직원 관리 시스템</h1>
        </div>
        <div class="header-actions">
          <span class="user-name">{{ userName }} 님</span>
          <button class="btn btn-secondary" @click="logout" type="button" aria-label="로그아웃">로그아웃</button>
          <button class="btn btn-primary detail-btn" @click="goToDetail()" type="button">
            <i class="fas fa-plus"></i> 직원 추가
          </button>
        </div>
      </header>
      
      <!-- 검색 및 필터 섹션 -->
      <div class="search-section">
        <div class="search-row">
          <!-- 필터 옵션 -->
          <div class="search-filters">
            <select 
              v-model="departmentFilter" 
              class="filter-select" 
              @change="applyFilters"
            >
              <option value="">전체 부서</option>
              <option value="DSS1">DSS1</option>
              <option value="DSS2">DSS2</option>
              <option value="CSC">CSC</option>
              <option value="HR">HR</option>
            </select>
            
            <select 
              v-model="positionFilter" 
              class="filter-select"
              @change="applyFilters"
            >
              <option value="">직급</option>
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
          
          <!-- 검색창 -->
          <div class="search-container">
            <div class="search-bar-wrap">
              <form class="search-input-group" @submit.prevent="applyFilters">
                <input 
                  type="text" 
                  v-model="searchInput" 
                  class="search-input" 
                  placeholder="직원명을 입력하세요."
                >
                <button type="button" 
                  v-if="searchInput"
                  @click="clearSearch" 
                  class="clear-search-btn"
                  :class="{ 'clear-search-btn-hidden': !searchInput }"
                >
                  <i class="fas fa-times"></i>
                </button>
                <button type="submit" class="do-search-btn btn btn-primary">검색</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 로딩 표시 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>로딩 중...</p>
      </div>
      
      <!-- 에러 메시지 -->
      <div v-if="error" class="error-container">
        <p class="error-message show">{{ error }}</p>
        <button @click="fetchEmployees" class="btn btn-primary">다시 시도</button>
      </div>
      
      <!-- 직원 테이블 -->
      <div v-if="!loading && !error">
        <table class="employee-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>직원명</th>
              <th>부서</th>
              <th>근무지</th>
              <th>직책</th>
              <th>입사일</th>
              <th>거주 지역</th>
              <th>통합 평가</th>
              <th>MITMAS 경력</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(employee, index) in employees" :key="employee.id" @click="goToDetail(employee.id)">
              <td :data-label="'No.'">{{ startIndex + index + 1 }}</td>
              <td :data-label="'직원명'">{{ employee.name }}</td>
              <td :data-label="'부서'">{{ employee.department }}</td>
              <td :data-label="'근무지'">{{ employee.location || '-' }}</td>
              <td :data-label="'직책'">{{ employee.position }}</td>
              <td :data-label="'입사일'">{{ formatDate(employee.join_date) }}</td>
              <td :data-label="'거주 지역'">{{ employee.address ? getAddressCity(employee.address) : '-' }}</td>
              <td :data-label="'통합 평가'">{{ employee.score ? employee.score.total : '-' }}</td>
              <td :data-label="'MITMAS 경력'">{{ formatCareer(employee.career_years) }}</td>
            </tr>
          </tbody>
        </table>
        
        <!-- 데이터가 없는 경우 -->
        <div v-if="employees.length === 0" class="no-data">
          <p>검색 결과가 없습니다.</p>
        </div>
        
        <!-- 페이지네이션 -->
        <div v-if="employees.length > 0" id="pagination" class="pagination">
          <button 
            :disabled="currentPage === 1" 
            @click="changePage(currentPage - 1)"
            class="btn btn-secondary"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <span v-for="page in paginationRange" :key="page">
            <button 
              v-if="page !== '...'" 
              :class="['btn', page === currentPage ? 'active' : '']"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
            <span v-else class="pagination-ellipsis">...</span>
          </span>
          
          <button 
            :disabled="currentPage === totalPages" 
            @click="changePage(currentPage + 1)"
            class="btn btn-secondary"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'EmployeeList',
  data() {
    return {
      departmentFilter: '',
      positionFilter: '',
      searchInput: '',
      inactivityTimer: null
    }
  },
  computed: {
    ...mapGetters('auth', ['currentUser']),
    ...mapGetters('employee', [
      'allEmployees', 
      'isLoading', 
      'hasError', 
      'errorMessage',
      'totalPages',
      'filters'
    ]),
    
    userName() {
      return this.currentUser ? this.currentUser.username : ''
    },
    
    employees() {
      return this.allEmployees
    },
    
    loading() {
      return this.isLoading
    },
    
    error() {
      return this.errorMessage
    },
    
    currentPage() {
      return this.$store.state.employee.currentPage
    },
    
    startIndex() {
      const perPage = this.$store.state.employee.perPage
      return (this.currentPage - 1) * perPage
    },
    
    // 페이지네이션 범위 계산
    paginationRange() {
      const total = this.totalPages
      const current = this.currentPage
      const range = []
      
      if (total <= 7) {
        // 7페이지 이하면 모든 페이지 표시
        for (let i = 1; i <= total; i++) {
          range.push(i)
        }
      } else {
        // 항상 현재 페이지 표시
        range.push(1) // 첫 페이지
        
        if (current > 3) {
          range.push('...')
        }
        
        // 현재 페이지 주변
        const start = Math.max(2, current - 1)
        const end = Math.min(total - 1, current + 1)
        
        for (let i = start; i <= end; i++) {
          range.push(i)
        }
        
        if (current < total - 2) {
          range.push('...')
        }
        
        range.push(total) // 마지막 페이지
      }
      
      return range
    }
  },
  
  created() {
    // 컴포넌트 생성 시 직원 목록 로드
    this.fetchEmployees()
    
    // 필터 상태 복원
    this.departmentFilter = this.filters.department
    this.positionFilter = this.filters.position
    this.searchInput = this.filters.search
    
    // 비활성 타이머 설정
    this.startInactivityTimer()
  },
  
  beforeDestroy() {
    // 타이머 정리
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer)
    }
  },
  
  methods: {
    ...mapActions('auth', ['logout']),
    ...mapActions('employee', [
      'fetchEmployees', 
      'setFilters',
      'setPage'
    ]),
    
    // 필터 적용
    applyFilters() {
      this.setFilters({
        department: this.departmentFilter,
        position: this.positionFilter,
        search: this.searchInput
      })
    },
    
    // 검색 초기화
    clearSearch() {
      this.searchInput = ''
      this.applyFilters()
    },
    
    // 페이지 변경
    changePage(page) {
      this.setPage(page)
    },
    
    // 직원 상세 페이지로 이동
    goToDetail(id) {
      if (id) {
        this.$router.push(`/employee-detail/${id}`)
      } else {
        this.$router.push('/employee-detail')
      }
    },
    
    // 날짜 포맷 (YYYY-MM-DD)
    formatDate(dateString) {
      if (!dateString) return '-'
      
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      
      return `${year}-${month}-${day}`
    },
    
    // 주소에서 도시만 추출
    getAddressCity(address) {
      if (!address) return '-'
      
      // '시', '도', '군' 단위로 분리
      const match = address.match(/([가-힣]+시|[가-힣]+도|[가-힣]+군)/)
      return match ? match[1] : address.split(' ')[0]
    },
    
    // 경력 포맷팅
    formatCareer(years) {
      if (!years) return '-'
      
      if (years < 1) {
        const months = Math.floor(years * 12)
        return `${months}개월`
      }
      
      const fullYears = Math.floor(years)
      const months = Math.floor((years - fullYears) * 12)
      
      if (months > 0) {
        return `${fullYears}년 ${months}개월`
      } else {
        return `${fullYears}년`
      }
    },
    
    // 자동 로그아웃 타이머
    startInactivityTimer() {
      const resetTimer = () => {
        if (this.inactivityTimer) {
          clearTimeout(this.inactivityTimer)
        }
        
        // 30분 후 자동 로그아웃
        this.inactivityTimer = setTimeout(() => {
          alert('30분 동안 활동이 없어 자동 로그아웃됩니다.')
          this.logout()
        }, 1800000) // 30분 = 1800000ms
      }
      
      // 사용자 활동 감지
      const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll']
      events.forEach(event => {
        window.addEventListener(event, resetTimer, true)
      })
      
      // 초기 타이머 설정
      resetTimer()
    }
  }
}
</script>

<style scoped>
/* 로딩 스피너 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 30px 0;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b983;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 에러 컨테이너 */
.error-container {
  text-align: center;
  padding: 20px;
}

/* 데이터 없음 */
.no-data {
  text-align: center;
  padding: 30px 0;
  color: #6c757d;
}

/* 테이블 관련 */
.table-container {
  overflow-x: auto;
}

.employee-table {
  width: 100%;
  border-collapse: collapse;
}

.employee-table tbody tr {
  cursor: pointer;
  transition: background-color 0.2s;
}

.employee-table tbody tr:hover {
  background-color: #f8f9fa;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 5px;
}

.pagination-ellipsis {
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
}
</style>