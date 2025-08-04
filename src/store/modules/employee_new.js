/**
 * Employee Vuex Store (Deprecated - MVVM으로 마이그레이션 예정)
 * ViewModel로 대체됩니다: @/viewmodels/EmployeeViewModel.js
 * 
 * MVVM 패턴 적용:
 * - Model: @/models/Employee.js
 * - ViewModel: @/viewmodels/EmployeeViewModel.js  
 * - View: Vue 컴포넌트들
 * - Service: @/services/EmployeeApiService.js
 */
import { employeeViewModel } from '@/viewmodels/EmployeeViewModel'

// 기존 Vuex 스토어를 ViewModel로 위임하는 어댑터 패턴
const state = {
  get employees() { return employeeViewModel.allEmployees },
  get currentEmployee() { return employeeViewModel.currentEmployee },
  get loading() { return employeeViewModel.isLoading },
  get error() { return employeeViewModel.errorMessage },
  get totalItems() { return employeeViewModel.state.totalItems },
  get filters() { return employeeViewModel.filters },
  get currentPage() { return employeeViewModel.currentPage },
  get perPage() { return employeeViewModel.perPage }
}

const getters = {
  allEmployees: () => employeeViewModel.allEmployees,
  currentEmployee: () => employeeViewModel.currentEmployee,
  isLoading: () => employeeViewModel.isLoading,
  hasError: () => employeeViewModel.hasError,
  errorMessage: () => employeeViewModel.errorMessage,
  totalPages: () => employeeViewModel.totalPages,
  filters: () => employeeViewModel.filters
}

const mutations = {
  // 뮤테이션은 ViewModel로 위임
}

const actions = {
  async fetchEmployees({ commit }, params) {
    if (params) {
      employeeViewModel.setFilters(params)
    }
    return await employeeViewModel.fetchEmployees()
  },
  
  async fetchEmployeeById({ commit }, id) {
    return await employeeViewModel.fetchEmployeeById(id)
  },
  
  async createEmployee({ commit }, employeeData) {
    return await employeeViewModel.createEmployee(employeeData)
  },
  
  async updateEmployee({ commit }, { id, data }) {
    return await employeeViewModel.updateEmployee(id, data)
  },
  
  async deleteEmployee({ commit }, id) {
    return await employeeViewModel.deleteEmployee(id)
  },
  
  setFilters({ commit }, filters) {
    employeeViewModel.setFilters(filters)
  },
  
  setCurrentPage({ commit }, page) {
    employeeViewModel.setCurrentPage(page)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
