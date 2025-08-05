/**
 * Employee ViewModel
 * View와 Model 사이의 비즈니스 로직을 담당
 * Vue 컴포넌트에서 사용할 수 있는 반응형 데이터와 메서드를 제공
 */
import { reactive, computed, ref } from 'vue';
import { Employee } from '@/models/Employee';
import { employeeApiService } from '@/services/EmployeeApiService';

export class EmployeeViewModel {
  constructor() {
    // 반응형 상태
    this.state = reactive({
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
    });
  }

  // Computed Properties (Getters)
  get allEmployees() {
    return this.state.employees;
  }

  get currentEmployee() {
    return this.state.currentEmployee;
  }

  get isLoading() {
    return this.state.loading;
  }

  get hasError() {
    return !!this.state.error;
  }

  get errorMessage() {
    return this.state.error;
  }

  get totalPages() {
    return Math.ceil(this.state.totalItems / this.state.perPage);
  }

  get filters() {
    return this.state.filters;
  }

  get currentPage() {
    return this.state.currentPage;
  }

  get perPage() {
    return this.state.perPage;
  }

  // Actions (Methods)
  async fetchEmployees() {
    this.setLoading(true);
    this.setError(null);

    try {
      const result = await employeeApiService.getEmployees({
        page: this.state.currentPage,
        limit: this.state.perPage,
        ...this.state.filters,
      });

      if (result.success) {
        this.state.employees = result.data;
        this.state.totalItems = result.total;
      } else {
        this.setError(result.error);
      }
    } catch (error) {
      this.setError('직원 목록을 불러오는데 실패했습니다.');
    } finally {
      this.setLoading(false);
    }
  }

  async fetchEmployeeById(id) {
    this.setLoading(true);
    this.setError(null);

    try {
      const result = await employeeApiService.getEmployeeById(id);

      if (result.success) {
        this.state.currentEmployee = result.data;
      } else {
        this.setError(result.error);
      }
    } catch (error) {
      this.setError('직원 정보를 불러오는데 실패했습니다.');
    } finally {
      this.setLoading(false);
    }
  }

  async createEmployee(employeeData) {
    this.setLoading(true);
    this.setError(null);

    try {
      // 모델 유효성 검사
      const employee = new Employee(employeeData);
      const validation = employee.validate();

      if (!validation.isValid) {
        this.setError(validation.errors.join(', '));
        return { success: false, errors: validation.errors };
      }

      const result = await employeeApiService.createEmployee(employee.toJSON());

      if (result.success) {
        // 목록 새로고침
        await this.fetchEmployees();
        return { success: true, data: result.data };
      } else {
        this.setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      this.setError('직원 생성에 실패했습니다.');
      return { success: false, error: '직원 생성에 실패했습니다.' };
    } finally {
      this.setLoading(false);
    }
  }

  async updateEmployee(id, employeeData) {
    this.setLoading(true);
    this.setError(null);

    try {
      // 모델 유효성 검사
      const employee = new Employee(employeeData);
      const validation = employee.validate();

      if (!validation.isValid) {
        this.setError(validation.errors.join(', '));
        return { success: false, errors: validation.errors };
      }

      const result = await employeeApiService.updateEmployee(id, employee.toJSON());

      if (result.success) {
        this.state.currentEmployee = result.data;
        // 목록도 업데이트
        const index = this.state.employees.findIndex((emp) => emp.id === id);
        if (index !== -1) {
          this.state.employees[index] = result.data;
        }
        return { success: true, data: result.data };
      } else {
        this.setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      this.setError('직원 수정에 실패했습니다.');
      return { success: false, error: '직원 수정에 실패했습니다.' };
    } finally {
      this.setLoading(false);
    }
  }

  async deleteEmployee(id) {
    this.setLoading(true);
    this.setError(null);

    try {
      const result = await employeeApiService.deleteEmployee(id);

      if (result.success) {
        // 목록에서 제거
        this.state.employees = this.state.employees.filter((emp) => emp.id !== id);
        this.state.totalItems -= 1;
        return { success: true };
      } else {
        this.setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      this.setError('직원 삭제에 실패했습니다.');
      return { success: false, error: '직원 삭제에 실패했습니다.' };
    } finally {
      this.setLoading(false);
    }
  }

  // 필터 설정
  setFilters(filters) {
    this.state.filters = { ...this.state.filters, ...filters };
    this.state.currentPage = 1; // 필터 변경 시 첫 페이지로
  }

  // 페이지 설정
  setCurrentPage(page) {
    this.state.currentPage = page;
  }

  // 로딩 상태 설정
  setLoading(status) {
    this.state.loading = status;
  }

  // 에러 설정
  setError(error) {
    this.state.error = error;
  }

  // 현재 직원 설정
  setCurrentEmployee(employee) {
    this.state.currentEmployee = employee;
  }

  // 상태 초기화
  reset() {
    this.state.employees = [];
    this.state.currentEmployee = null;
    this.state.loading = false;
    this.state.error = null;
    this.state.totalItems = 0;
    this.state.currentPage = 1;
  }
}

// 싱글톤 인스턴스 생성
export const employeeViewModel = new EmployeeViewModel();
export default employeeViewModel;
