<template>
  <div class="employee-list-container">
    <!-- 헤더 섹션 -->
    <div class="header-section">
      <h1>직원 목록</h1>
      <HeaderActions
        :current-user="currentUser"
        @logout="logout"
        @refresh="refreshData"
        @add="navigateToDetail('new')"
      />
    </div>

    <!-- 검색 및 필터 섹션 -->
    <div class="search-filter-section">
      <SearchBar
        v-model="searchQuery"
        :placeholder="'직원명, 이메일, 부서, 직급으로 검색...'"
        @input="handleSearch"
        @enter="performSearch"
        @clear="clearSearch"
        @search="performSearch"
      />

      <FilterControls
        :filters="filters"
        @update:filters="val => { filters = val; applyFilters(); }"
        @clear="clearFilters"
      />
    </div>

    <!-- 직원 목록 테이블 -->
      <EmployeeTable
        :loading="loading"
        :filtered-employees="filteredEmployees"
        :paginated-employees="paginatedEmployees"
        :current-page="currentPage"
        :page-size="pageSize"
        :get-sort-icon="getSortIcon"
        :get-department-class="getDepartmentClass"
        :get-position-class="getPositionClass"
        :format-date="formatDate"
        :format-career="formatCareer"
        @sort="sortByColumn"
        @detail="navigateToDetail"
      />

    <!-- 페이지네이션 -->
    <Pagination
      v-if="totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      @change="changePage"
    />
  </div>
</template>



<script>
import { mapActions, mapGetters } from 'vuex';
import Button from '@/components/common/Button.vue';
import HeaderActions from '@/components/employee/common/HeaderActions.vue';
import CommonInput from '@/components/common/CommonInput.vue';
import SearchBar from '@/components/employee/list/SearchBar.vue';
import FilterControls from '@/components/employee/list/FilterControls.vue';
import EmployeeTable from '@/components/employee/list/EmployeeTable.vue';
import Pagination from '@/components/employee/list/Pagination.vue';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export default {
  name: 'EmployeeList',
  components: { Button, CommonInput, HeaderActions, SearchBar, FilterControls, EmployeeTable, Pagination },
  data() {
    return {
      searchQuery: '',
      filters: {
        department: '',
        position: '',
        search: '',
      },
      currentPage: 1,
      pageSize: 10,
      loading: false,
      searchTimeout: null,
      sortBy: 'position', // 기본 정렬: 직급
      sortOrder: 'desc', // 내림차순
    };
  },
  computed: {
    ...mapGetters('auth', ['currentUser']),
    ...mapGetters('employee', ['allEmployees', 'totalItems']),

    filteredEmployees() {
      let employees = [...this.allEmployees];

      // 검색 필터 적용
      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        employees = employees.filter(
          (employee) =>
            employee.name?.toLowerCase().includes(searchTerm) ||
            employee.email?.toLowerCase().includes(searchTerm) ||
            employee.department?.toLowerCase().includes(searchTerm) ||
            employee.position?.toLowerCase().includes(searchTerm),
        );
      }

      // 부서 필터 적용
      if (this.filters.department) {
        employees = employees.filter((employee) => employee.department === this.filters.department);
      }

      // 직급 필터 적용
      if (this.filters.position) {
        employees = employees.filter((employee) => employee.position === this.filters.position);
      }

      // 정렬 적용
      if (this.sortBy) {
        employees.sort((a, b) => {
          let aVal = a[this.sortBy];
          let bVal = b[this.sortBy];

          // 직급 필드 특별 처리 (DB 저장 순서대로)
          if (this.sortBy === 'position') {
            const positionOrder = [
              '사원',
              '대리',
              '과장',
              '차장',
              '부장',
              '실장',
              '본부장',
              '이사',
              '부사장',
              '사장',
            ];
            const aIndex = positionOrder.indexOf(aVal);
            const bIndex = positionOrder.indexOf(bVal);

            // 순서가 정의되지 않은 직급은 맨 끝으로
            const aOrder = aIndex === -1 ? 999 : aIndex;
            const bOrder = bIndex === -1 ? 999 : bIndex;

            let positionResult = 0;
            if (aOrder < bOrder) positionResult = this.sortOrder === 'asc' ? -1 : 1;
            else if (aOrder > bOrder) positionResult = this.sortOrder === 'asc' ? 1 : -1;

            // 직급이 같으면 경력으로 2차 정렬 (내림차순)
            if (positionResult === 0) {
              const aCareer = parseFloat(a.mitmas_total_career || 0);
              const bCareer = parseFloat(b.mitmas_total_career || 0);
              if (aCareer > bCareer) return -1; // 경력 내림차순
              if (aCareer < bCareer) return 1;
              return 0;
            }

            return positionResult;
          }

          // 날짜 필드 처리
          if (this.sortBy === 'hire_date') {
            aVal = new Date(aVal || 0);
            bVal = new Date(bVal || 0);
          }

          // 숫자 필드 처리
          if (this.sortBy === 'total_score' || this.sortBy === 'mitmas_total_career') {
            aVal = parseFloat(aVal || 0);
            bVal = parseFloat(bVal || 0);
          }

          // 문자열 필드 처리
          if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
          }

          if (aVal < bVal) return this.sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return this.sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      } else {
        // 기본 정렬: 직급 내림차순 → 경력 내림차순
        employees.sort((a, b) => {
          const positionOrder = [
            '사원',
            '대리',
            '과장',
            '차장',
            '부장',
            '실장',
            '본부장',
            '이사',
            '부사장',
            '사장',
          ];

          const aIndex = positionOrder.indexOf(a.position);
          const bIndex = positionOrder.indexOf(b.position);
          const aOrder = aIndex === -1 ? 999 : aIndex;
          const bOrder = bIndex === -1 ? 999 : bIndex;

          // 1차 정렬: 직급 내림차순
          if (aOrder !== bOrder) {
            return bOrder - aOrder; // 내림차순
          }

          // 2차 정렬: 경력 내림차순
          const aCareer = parseFloat(a.mitmas_total_career || 0);
          const bCareer = parseFloat(b.mitmas_total_career || 0);
          return bCareer - aCareer; // 내림차순
        });
      }

      return employees;
    },

    paginatedEmployees() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredEmployees.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.filteredEmployees.length / this.pageSize);
    },

    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, this.currentPage + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },
  },
  async created() {
    await this.loadEmployees('created');
  },
  beforeUnmount() {
    // 컴포넌트 파괴 시 타이머 정리
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  },
  methods: {
    ...mapActions('employee', ['fetchEmployees']),
    ...mapActions('auth', ['logout']),

    async loadEmployees(trigger = '') {
      this.loading = true;
      try {
        await this.fetchEmployees();
      } catch (error) {
        console.error('직원 목록 로드 실패:', error);
        toast.error('직원 목록을 불러오는데 실패했습니다.');
      } finally {
        this.loading = false;
      }
    },

    async refreshData() {
      await this.loadEmployees('refreshData');
      toast.success('데이터가 새로고침되었습니다.');
    },

    handleSearch() {
      // 디바운싱을 위해 기존 타이머 클리어
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // 500ms 후에 검색 실행
      this.searchTimeout = setTimeout(() => {
        this.filters.search = this.searchQuery;
        this.currentPage = 1;
      }, 500);
    },

    performSearch() {
      this.filters.search = this.searchQuery;
      this.currentPage = 1;
    },

    clearSearch() {
      this.searchQuery = '';
      this.filters.search = '';
      this.currentPage = 1;

      // 타이머도 클리어
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
    },

    sortByColumn(field) {
      if (this.sortBy === field) {
        // 같은 필드 클릭 시 정렬 순서 변경
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        // 다른 필드 클릭 시 새로운 필드로 오름차순 정렬
        this.sortBy = field;
        this.sortOrder = 'asc';
      }
      this.currentPage = 1;
    },

    getSortIcon(field) {
      if (this.sortBy !== field) return 'fas fa-sort';
      return this.sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    },

    applyFilters() {
      this.currentPage = 1;
    },

    clearFilters() {
      this.filters = {
        department: '',
        position: '',
        search: '',
      };
      this.searchQuery = '';
      this.currentPage = 1;
      this.sortBy = '';
      this.sortOrder = 'asc';

      // 타이머도 클리어
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    navigateToDetail(id) {
      if (id === 'new') {
        this.$router.push('/employee-detail/new');
      } else {
        this.$router.push(`/employee-detail/${id}`);
      }
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('ko-KR');
    },

    formatCareer(months) {
      if (!months || months === 0) return '0개월';

      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;

      let result = '';
      if (years > 0) {
        result += `${years}년`;
      }
      if (remainingMonths > 0) {
        if (result) result += ' ';
        result += `${remainingMonths}개월`;
      }

      return result || '0개월';
    },

    getDepartmentClass(department) {
      switch (department) {
        case 'DSS1':
          return 'dept-dss1';
        case 'DSS2':
          return 'dept-dss2';
        case 'CSC':
          return 'dept-csc';
        case 'HR':
          return 'dept-hr';
        default:
          return 'dept-default';
      }
    },

    getPositionClass(position) {
      switch (position) {
        case '사원':
          return 'pos-junior';
        case '대리':
          return 'pos-associate';
        case '과장':
          return 'pos-manager';
        case '차장':
          return 'pos-deputy';
        case '부장':
          return 'pos-director';
        case '실장':
          return 'pos-head';
        case '본부장':
          return 'pos-division';
        case '이사':
          return 'pos-executive';
        case '부사장':
          return 'pos-vp';
        case '사장':
          return 'pos-president';
        default:
          return 'pos-default';
      }
    },
  },
};
</script>

<style scoped>
/* EmployeeList 컴포넌트 특화 스타일 */
/* 대부분의 스타일은 분할된 CSS 파일로 이동했습니다 */
/* 이 컴포넌트에서만 필요한 특별한 스타일이 있으면 여기에 추가 */
.searchbar-root{
  margin-bottom: 16px;
}

</style>
