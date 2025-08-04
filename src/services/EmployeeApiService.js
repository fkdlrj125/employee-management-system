/**
 * Employee API Service
 * 백엔드 API와의 통신을 담당
 */
import axios from 'axios'
import { Employee } from '@/models/Employee'

class EmployeeApiService {
  constructor() {
    this.baseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api'
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // 요청 인터셉터 (토큰 추가)
    this.api.interceptors.request.use(
      config => {
        const token = sessionStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      error => Promise.reject(error)
    )

    // 응답 인터셉터 (에러 처리)
    this.api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          // 토큰 만료 시 로그인 페이지로 리다이렉트
          sessionStorage.removeItem('token')
          sessionStorage.removeItem('user')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // 직원 목록 조회
  async getEmployees(params = {}) {
    try {
      const response = await this.api.get('/employees', { params })
      return {
        success: true,
        data: response.data.employees?.map(emp => new Employee(emp)) || [],
        total: response.data.total || 0,
        message: response.data.message
      }
    } catch (error) {
      return this.handleError(error, '직원 목록을 불러오는데 실패했습니다.')
    }
  }

  // 직원 상세 조회
  async getEmployeeById(id) {
    try {
      const response = await this.api.get(`/employees/${id}`)
      return {
        success: true,
        data: new Employee(response.data.employee),
        message: response.data.message
      }
    } catch (error) {
      return this.handleError(error, '직원 정보를 불러오는데 실패했습니다.')
    }
  }

  // 직원 생성
  async createEmployee(employeeData) {
    try {
      const formData = this.prepareFormData(employeeData)
      const response = await this.api.post('/employees', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return {
        success: true,
        data: new Employee(response.data.employee),
        message: response.data.message
      }
    } catch (error) {
      return this.handleError(error, '직원 생성에 실패했습니다.')
    }
  }

  // 직원 수정
  async updateEmployee(id, employeeData) {
    try {
      const formData = this.prepareFormData(employeeData)
      const response = await this.api.put(`/employees/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return {
        success: true,
        data: new Employee(response.data.employee),
        message: response.data.message
      }
    } catch (error) {
      return this.handleError(error, '직원 수정에 실패했습니다.')
    }
  }

  // 직원 삭제
  async deleteEmployee(id) {
    try {
      const response = await this.api.delete(`/employees/${id}`)
      return {
        success: true,
        message: response.data.message
      }
    } catch (error) {
      return this.handleError(error, '직원 삭제에 실패했습니다.')
    }
  }

  // FormData 준비 (파일 업로드 포함)
  prepareFormData(employeeData) {
    const formData = new FormData()
    
    // 이미지 파일이 있는 경우
    if (employeeData.photoFile) {
      formData.append('photo', employeeData.photoFile)
      delete employeeData.photoFile
    }
    
    // 나머지 데이터는 JSON으로 추가
    formData.append('data', JSON.stringify(employeeData))
    
    return formData
  }

  // 에러 처리
  handleError(error, defaultMessage) {
    console.error('API Error:', error)
    
    let message = defaultMessage
    if (error.response?.data?.message) {
      message = error.response.data.message
    } else if (error.message) {
      message = error.message
    }
    
    return {
      success: false,
      error: message,
      data: null
    }
  }
}

// 싱글톤 인스턴스 생성
export const employeeApiService = new EmployeeApiService()
export default employeeApiService
