const getDefaultState = () => ({
  employees: [],
  currentEmployee: null,
  loading: false,
  error: null,
  totalItems: 0,
  filters: {
    department: '',
    position: '',
    search: '',
  },
  currentPage: 1,
  perPage: 10,
  totalPages: 1,
  limit: 10,
});

/**
 * Employee Vuex Store
 * 임시 더미 데이터 사용 (백엔드 서버 연결 전까지)
 */
import EmployeeApiService from '@/services/EmployeeApiService';
import { toast } from 'vue3-toastify';

const state = getDefaultState();

const getters = {
  allEmployees: (state) => state.employees,
  currentEmployee: (state) => state.currentEmployee,
  isLoading: (state) => state.loading,
  hasError: (state) => !!state.error,
  errorMessage: (state) => state.error,
  totalPages: (state) => state.totalPages,
  currentPage: (state) => state.currentPage,
  pageSize: (state) => state.limit,
  filters: (state) => state.filters,
};

const mutations = {
  RESET_STATE(state) {
    Object.assign(state, getDefaultState());
  },
  SET_LOADING(state, status) {
    state.loading = status;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  SET_EMPLOYEES(state, { employees, total, page, limit, totalPages }) {
    state.employees = employees;
    state.totalItems = total;
    state.currentPage = page || 1;
    state.limit = limit || 10;
    state.totalPages = totalPages || 1;
  },
  SET_CURRENT_EMPLOYEE(state, employee) {
    state.currentEmployee = employee;
  },
  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters };
  },
  SET_CURRENT_PAGE(state, page) {
    state.currentPage = page;
  },
};

const actions = {
  resetState({ commit }) {
    commit('RESET_STATE');
  },
  // 직원 목록 조회 (실제 API 연동)
  async fetchEmployees({ commit, state }, payload = {}) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      // payload가 null이면 빈 객체로 처리
      if (!payload) payload = {};
      // page, limit, filters 모두 params로 전달
      const params = {
        ...state.filters,
        page: payload.page || state.currentPage || 1,
        limit: payload.limit || state.limit || 10,
        sortBy: payload.sortBy || state.sortBy || 'position',
        sortOrder: payload.sortOrder || state.sortOrder || 'desc',
      };
      const res = await EmployeeApiService.getEmployees(params);
      if (res.success && res.data) {
        commit('SET_EMPLOYEES', {
          employees: res.data,
          total: res.total,
          page: res.page || params.page,
          limit: res.limit || params.limit,
          totalPages: res.totalPages || 1,
        });
      } else {
        commit('SET_ERROR', res.error || '직원 목록을 불러오는데 실패했습니다.');
        toast.error(`[employee] API error: ${res.error}`);
      }
    } catch (error) {
      commit('SET_ERROR', error.message || '직원 목록을 불러오는데 실패했습니다.');
      toast.error(`[employee] fetchEmployees exception: ${error}`);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  // 직원 상세 조회 (실제 API 연동)
  async fetchEmployeeById({ commit }, id) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const res = await EmployeeApiService.getEmployeeById(id);
      if (res.success) {
        commit('SET_CURRENT_EMPLOYEE', res.data);
      } else {
        commit('SET_ERROR', res.error || '직원 정보를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      commit('SET_ERROR', error.message || '직원 정보를 불러오는데 실패했습니다.');
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // 기타 액션들 (임시 구현)
  // 직원 등록 (실제 API 연동)
  async createEmployee({ commit, dispatch }, employeeData) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const res = await EmployeeApiService.createEmployee(employeeData);
      if (res.success) {
        // 등록 후 목록 갱신 등 필요시 dispatch 사용
        return res;
      } else {
        commit('SET_ERROR', res.error || '직원 등록에 실패했습니다.');
        return res;
      }
    } catch (error) {
      commit('SET_ERROR', error.message || '직원 등록에 실패했습니다.');
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // 직원 수정 (실제 API 연동)
  async updateEmployee({ commit, dispatch }, { id, data }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const res = await EmployeeApiService.updateEmployee(id, data);
      if (res.success) {
        // 수정 후 목록/상세 갱신 등 필요시 dispatch 사용
        return res;
      } else {
        commit('SET_ERROR', res.error || '직원 정보 수정에 실패했습니다.');
        return res;
      }
    } catch (error) {
      commit('SET_ERROR', error.message || '직원 정보 수정에 실패했습니다.');
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // 직원 삭제 (실제 API 연동)
  async deleteEmployee({ commit, dispatch }, id) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const res = await EmployeeApiService.deleteEmployee(id);
      if (res.success) {
        // 삭제 후 목록 갱신 등 필요시 dispatch 사용
        return res;
      } else {
        commit('SET_ERROR', res.error || '직원 삭제에 실패했습니다.');
        return res;
      }
    } catch (error) {
      commit('SET_ERROR', error.message || '직원 삭제에 실패했습니다.');
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  setFilters({ commit, rootState }, filters) {
    // admin이 아니면 department를 본인 부서로 강제 고정
    const user = rootState.auth && rootState.auth.user;
    // 디버깅: 로그인 유저 정보와 department 설정 로그 출력
    if (user && user.role !== 'admin') {
      commit('SET_FILTERS', { ...filters, department: user.role });
    } else {
      commit('SET_FILTERS', filters);
    }
    return Promise.resolve();
  },

  setCurrentPage({ commit }, page) {
    commit('SET_CURRENT_PAGE', page);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
