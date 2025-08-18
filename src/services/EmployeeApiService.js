// ...existing code...
/**
 * Employee API Service
 * 백엔드 API와의 통신을 담당
 */
import axios from 'axios';
import { Employee } from '@/models/Employee';

class EmployeeApiService {
  constructor() {
    this.baseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api';
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 요청 인터셉터 (토큰 추가)
    this.api.interceptors.request.use(
      (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // 응답 인터셉터 (에러 처리)
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // 토큰 만료 시 로그인 페이지로 리다이렉트
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      },
    );
  }

  // 직원 목록 조회 (실제 API)
  async getEmployees(params = {}) {
    try {
      const response = await this.api.get('/employees', { params });
      // 백엔드 응답 구조: { success, data: { employees, total, ... } }
      const employees = response.data?.data?.employees || [];
      const total = response.data?.data?.total || 0;
      return {
        success: true,
        data: employees,
        total,
        message: '직원 목록을 성공적으로 불러왔습니다.',
      };
    } catch (error) {
      return this.handleError(error, '직원 목록을 불러오는데 실패했습니다.');
    }
  }

  // 직원 상세 조회 (실제 API)
  async getEmployeeById(id) {
    try {
      const response = await this.api.get(`/employees/${id}`);
      // response.data가 { success, employee, ... } 구조일 수 있음
      let employeeData = response.data.employee || response.data;
      // 백엔드에서 certifications, external_projects로 오면 프론트 key로 매핑
      if (employeeData) {
        employeeData = {
          ...employeeData,
          certificates: employeeData.certifications || [],
          projects: employeeData.external_projects || [],
        };
      }
      return {
        success: true,
        data: employeeData,
        message: '직원 정보를 성공적으로 불러왔습니다.',
      };
    } catch (error) {
      return this.handleError(error, '직원 정보를 불러오는데 실패했습니다.');
    }
  }

    // 이름(부분일치)로 사원 리스트 검색 (자동완성용)
  async searchEmployeesByName(name) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200)); // 로딩 시뮬레이션
      const lower = name.trim().toLowerCase();
      const results = dummyEmployees.filter(
        (emp) => emp.name && emp.name.toLowerCase().includes(lower)
      );
      return {
        success: true,
        data: results.map((emp) => new Employee(emp)),
        message: '검색 결과',
      };
    } catch (error) {
      return this.handleError(error, '이름 검색에 실패했습니다.');
    }
  }

  // 직원 생성 (실제 API)
  async createEmployee(employeeData) {
    try {
      const response = await this.api.post('/employees', employeeData);
      return {
        success: true,
        data: response.data,
        message: '직원이 성공적으로 등록되었습니다.',
      };
    } catch (error) {
      return this.handleError(error, '직원 생성에 실패했습니다.');
    }
  }

  // 직원 수정 (실제 API)
  async updateEmployee(id, employeeData) {
    try {
      const response = await this.api.put(`/employees/${id}`, employeeData);
      return {
        success: true,
        data: response.data,
        message: response.data.message || '직원 정보가 성공적으로 수정되었습니다.',
      };
    } catch (error) {
      return this.handleError(error, '직원 수정에 실패했습니다.');
    }
  }

  // 직원 삭제 (실제 API)
  async deleteEmployee(id) {
    try {
      const response = await this.api.delete(`/employees/${id}`);
      return {
        success: true,
        message: '직원이 성공적으로 삭제되었습니다.',
      };
    } catch (error) {
      return this.handleError(error, '직원 삭제에 실패했습니다.');
    }
  }

  // FormData 준비 (파일 업로드 포함)
  prepareFormData(employeeData) {
    const formData = new FormData();

    // 이미지 파일이 있는 경우
    if (employeeData.photoFile) {
      formData.append('photo', employeeData.photoFile);
      delete employeeData.photoFile;
    }

    // 나머지 데이터는 객체 그대로 추가
    Object.entries(employeeData).forEach(([key, value]) => {
      if (Array.isArray(value) || typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    return formData;
  }

  // 에러 처리
  handleError(error, defaultMessage) {

    let message = defaultMessage;
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }

    return {
      success: false,
      error: message,
      data: null,
    };
  }
}

// 싱글톤 인스턴스 생성
export const employeeApiService = new EmployeeApiService();
export default employeeApiService;
