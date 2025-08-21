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
      />

      <FilterControls
        :filters="filters"
        @update:filters="val => { filters = val; applyFilters(); }"
        @clear="clearFilters"
      />
    </div>

    <!-- 직원 목록 테이블 -->
    <EmployeeTable
      :employees="employees"
      :loading="loading"
      :get-sort-icon="getSortIcon"
      :get-department-class="getDepartmentClass"
      :get-position-class="getPositionClass"
      :format-date="formatDate"
      :format-career="formatCareer"
      :get-mitmas-career="getMitmasCareer"
      :current-page="currentPage"
      :page-size="pageSize"
      @sort="sortByColumn"
      @detail="navigateToDetail"
    />

    <!-- 페이지네이션 컴포넌트 -->
      <Pagination
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        :page-size="pageSize"
        @page-changed="setCurrentPage"
      />
  </div>
</template>



<script>
import { mapActions, mapGetters } from 'vuex';
import Button from '@/components/common/Button.vue';
import HeaderActions from '@/components/employee/list/ListHeader.vue';
import CommonInput from '@/components/common/CommonInput.vue';
import SearchBar from '@/components/employee/list/SearchBar.vue';
import Pagination from '@/components/employee/list/Pagination.vue';
import FilterControls from '@/components/employee/list/FilterControls.vue';
import EmployeeTable from '@/components/employee/list/EmployeeTable.vue';
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
      },
      loading: false,
      searchTimeout: null,
      sortBy: 'position', // 기본 정렬: 직급
      sortOrder: 'desc', // 내림차순
    };
  },
  computed: {
    ...mapGetters('auth', ['currentUser']),
    ...mapGetters('employee', ['allEmployees', 'totalPages', 'currentPage', 'pageSize']),
    employees() {
      return this.allEmployees;
    },
  },
  async created() {
    // 최초 진입 시 store의 state.filters를 local filters에 동기화
    this.filters = { ...this.$store.state.employee.filters };
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

    setCurrentPage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.$store.commit('employee/SET_CURRENT_PAGE', page);
      this.loadEmployees('pagination');
    },

    sortByColumn(field) {
      console.log('[EmployeeList][sortByColumn] field:', field);
      const now = Date.now();
      if (this.lastSortClick && now - this.lastSortClick < 700) {
        toast.warn('너무 빠르게 요청 중입니다. 잠시만 기다려주세요.');
        return;
      }
      this.lastSortClick = now;
      if (this.sortBy === field) {
        // 같은 필드 클릭 시 정렬 순서 변경
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        // 다른 필드 클릭 시 새로운 필드로 오름차순 정렬
        this.sortBy = field;
        this.sortOrder = 'asc';
      }
      this.currentPage = 1;
      this.loadEmployees('sort');
    },

    async loadEmployees(trigger = '') {
      console.log('[Function] loadEmployees', trigger);
      this.loading = true;
      try {
        // 항상 store의 filters만 사용
          const vuexFilters = { ...this.$store.state.employee.filters };
  console.log('[loadEmployees] 파라미터:', {
    page: this.currentPage,
    limit: this.pageSize,
    department: vuexFilters.department,
    position: vuexFilters.position,
    search: vuexFilters.search,
    sortBy: this.sortBy,
    sortOrder: this.sortOrder,
  });
        const params = {
          page: this.currentPage,
          limit: this.pageSize,
          department: vuexFilters.department,
          position: vuexFilters.position,
          search: vuexFilters.search, // store의 filters를 항상 사용
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
        };
        // 디버깅: API 요청 파라미터 로그 출력
        console.log('[loadEmployees] 최종 파라미터:', params);
        await this.fetchEmployees(params);
      } catch (error) {
        toast.error('직원 목록을 불러오는데 실패했습니다.');
      } finally {
        this.loading = false;
      }
    },

    async refreshData() {
      await this.loadEmployees('refreshData');
      toast.success('데이터가 새로고침되었습니다.');
    },

    handleSearch(val) {
      console.log('[Function] handleSearch', val);
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      this.searchTimeout = setTimeout(() => {
        this.searchQuery = val;
        this.filters.search = val;
        if (typeof this.$emit === 'function') {
          this.$emit('update:filters', { ...this.filters });
        }
        // filters를 store에 반영한 후 반드시 then에서 loadEmployees 호출
        this.$store.dispatch('employee/setFilters', this.filters).then(() => {
          this.loadEmployees('search');
        });
      }, 500);
    },



    clearSearch() {
      console.log('[Function] clearSearch');
      this.searchQuery = '';
      this.filters.search = '';
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      this.applyFilters();
      this.loadEmployees('clearSearch');
    },

    getSortIcon(field) {
      if (this.sortBy !== field) return 'fas fa-sort';
      return this.sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    },

applyFilters() {
  console.log('[Function] applyFilters', this.filters);
  this.$store.dispatch('employee/setFilters', this.filters).then(() => {
    // store의 filters를 반드시 최신으로 덮어씀
    this.filters = { ...this.$store.state.employee.filters };
    this.setCurrentPage(1);
    // 반드시 store의 filters를 loadEmployees에 전달
    this.loadEmployees('filter');
  });
},

clearFilters() {
  console.log('[Function] clearFilters');
  this.filters = {
    department: '',
    position: '',
    search: '',
  };
  this.searchQuery = '';
  this.filters.search = '';
  this.sortBy = 'position';
  this.sortOrder = 'desc';
  this.$store.dispatch('employee/setFilters', this.filters);
  if (typeof this.$emit === 'function') {
    this.$emit('update:filters', { ...this.filters });
  }
  this.loadEmployees('clearFilters');
},

performSearch() {
  if (this.searchTimeout) {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = null;
  }
  this.filters.search = this.searchQuery;
  this.$store.dispatch('employee/setFilters', this.filters);
  this.loadEmployees('search');
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

    getMitmasCareer(hireDate) {
      if (!hireDate) return '0개월';
      const start = new Date(hireDate);
      const now = new Date();
      let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
      if (now.getDate() < start.getDate()) months--;
      if (months < 0) months = 0;
      return this.formatCareer(months);
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
