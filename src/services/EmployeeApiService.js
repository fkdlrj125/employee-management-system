// ...existing code...
/**
 * Employee API Service
 * 백엔드 API와의 통신을 담당 (현재는 더미 데이터 사용)
 */
import axios from 'axios';
import { Employee } from '@/models/Employee';

// 더미 데이터
const dummyEmployees = [
  {
    id: 1,
    name: '김철수',
    birth_date: '1985-03-15',
    department: '개발팀',
    position: '선임개발자',
    hire_date: '2020-01-15',
    mitmas_career: '3년 6개월',
    total_career: '8년 2개월',
    email: 'kim.cs@company.com',
    phone: '010-1234-5678',
    address: '서울시 강남구 테헤란로 123',
    workplace: '본사',
    skills: 'JavaScript, Vue.js, Node.js, Python',
    photo: null,
    educations: [
      {
        admission_year: 2004,
        graduation_year: 2008,
        school_name: '서울대학교',
        major: '컴퓨터공학',
        degree: '대학교',
        gpa: '3.8/4.5',
      },
    ],
    careers: [
      {
        startDate: '2015-03-01',
        endDate: '2019-12-31',
        company_name: '(주)테크놀로지',
        department: '개발부',
        position: '주임개발자',
        responsibilities: '웹 애플리케이션 개발',
      },
    ],
    certificates: [
      {
        acquisition_date: '2019-06-15',
        certificate_name: '정보처리기사',
        issuing_authority: '한국산업인력공단',
        grade: '1급',
      },
    ],
    projects: [
      {
        startDate: '2021-01-01',
        endDate: '2021-12-31',
        project_name: '직원관리시스템',
        role: '프론트엔드 개발',
        technologies: 'Vue.js, JavaScript, CSS',
      },
    ],
  },
  {
    id: 2,
    name: '이영희',
    birth_date: '1990-07-22',
    department: '디자인팀',
    position: '주임디자이너',
    hire_date: '2021-06-01',
    mitmas_career: '2년 8개월',
    total_career: '5년 3개월',
    email: 'lee.yh@company.com',
    phone: '010-9876-5432',
    address: '서울시 서초구 강남대로 456',
    workplace: '본사',
    skills: 'Photoshop, Illustrator, Figma, Sketch',
    photo: null,
    educations: [
      {
        admission_year: 2009,
        graduation_year: 2013,
        school_name: '홍익대학교',
        major: '시각디자인',
        degree: '대학교',
        gpa: '3.9/4.5',
      },
    ],
    careers: [
      {
        startDate: '2018-07-01',
        endDate: '2021-05-31',
        company_name: '크리에이티브에이전시',
        department: '디자인팀',
        position: '디자이너',
        responsibilities: 'UI/UX 디자인',
      },
    ],
    certificates: [
      {
        acquisition_date: '2020-03-10',
        certificate_name: '웹디자인기능사',
        issuing_authority: '한국산업인력공단',
        grade: '1급',
      },
    ],
    projects: [
      {
        startDate: '2022-03-01',
        endDate: '2022-11-30',
        project_name: '모바일 앱 리뉴얼',
        role: 'UI/UX 디자인',
        technologies: 'Figma, Sketch, Photoshop',
      },
    ],
  },
  {
    id: 3,
    name: '박민수',
    birth_date: '1988-12-05',
    department: '마케팅팀',
    position: '과장',
    hire_date: '2019-03-20',
    mitmas_career: '4년 11개월',
    total_career: '7년 6개월',
    email: 'park.ms@company.com',
    phone: '010-5555-1234',
    address: '서울시 마포구 월드컵로 789',
    workplace: '본사',
    skills: '디지털마케팅, SNS마케팅, 데이터분석',
    photo: null,
    educations: [
      {
        admission_year: 2007,
        graduation_year: 2011,
        school_name: '연세대학교',
        major: '경영학',
        degree: '대학교',
        gpa: '3.7/4.5',
      },
    ],
    careers: [
      {
        startDate: '2016-09-01',
        endDate: '2019-02-28',
        company_name: '광고대행사',
        department: '마케팅부',
        position: '주임',
        responsibilities: '온라인 광고 기획 및 집행',
      },
    ],
    certificates: [
      {
        acquisition_date: '2018-11-20',
        certificate_name: '구글애널리틱스자격증',
        issuing_authority: 'Google',
        grade: 'Professional',
      },
    ],
    projects: [
      {
        startDate: '2023-01-15',
        endDate: '2023-06-30',
        project_name: '브랜드 리뉴얼 캠페인',
        role: '마케팅 기획',
        technologies: 'Google Analytics, Facebook Ads',
      },
    ],
  },
];

class EmployeeApiService {
  // 기술역량 점수만 별도 저장 (skillScores/leaderSkillScores)
  async updateEmployeeSkillScores(id, { skillScores, leaderSkillScores }) {
    try {
      const response = await this.api.put(`/employees/${id}/skill-scores`, { skillScores, leaderSkillScores });
      return {
        success: response.data.success,
        data: response.data,
        message: response.data.message,
      };
    } catch (error) {
      return this.handleError(error, '기술역량 점수 저장에 실패했습니다.');
    }
  }

  // 직원 성장 추이(기간별 성과) 조회
  async getPerformanceTrend(employeeId, { role = 'member', from, to }) {
    try {
      const params = { role, from, to };
      const response = await this.api.get(`/employees/${employeeId}/performance-trend`, { params });
      return {
        success: true,
        data: response.data.trend,
        employeeId: response.data.employeeId,
        role: response.data.role,
        message: '직원 성장 추이 데이터를 성공적으로 불러왔습니다.'
      };
    } catch (error) {
      return this.handleError(error, '직원 성장 추이 데이터를 불러오는데 실패했습니다.');
    }
  }
  // 연도별 평가점수 이력 저장 (실제 API)
  async saveEvaluationHistory(evaluationData) {
    try {
      const response = await this.api.post('/evaluations', evaluationData);
      return response.data;
    } catch (error) {
      return this.handleError(error, '평가 이력 저장에 실패했습니다.');
    }
  }

  // 연도별 평가점수 이력 조회 (실제 API)
  async getEvaluationHistory(employeeId, year = null) {
    try {
      let url = `/evaluations/${employeeId}`;
      if (year) {
        url += `?year=${year}`;
      }
      const response = await this.api.get(url);
      return response.data;
    } catch (error) {
      return this.handleError(error, '평가 이력 조회에 실패했습니다.');
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
        console.log('[EmployeeApiService] request interceptor token:', token);
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

  // 직원 생성 (실제 API)
  async createEmployee(employeeData) {
    try {
      const response = await this.api.post('/employees', { data: JSON.stringify(employeeData) });
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
      const response = await this.api.put(`/employees/${id}`, { data: JSON.stringify(employeeData) });
      return {
        success: true,
        data: response.data,
        message: '직원 정보가 성공적으로 수정되었습니다.',
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

    // 나머지 데이터는 JSON으로 추가
    formData.append('data', JSON.stringify(employeeData));

    return formData;
  }

  // 에러 처리
  handleError(error, defaultMessage) {
    console.error('API Error:', error);

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
