/**
 * Employee Vuex Store
 * 임시 더미 데이터 사용 (백엔드 서버 연결 전까지)
 */
import axios from 'axios'

const state = {
  employees: [],
  currentEmployee: null,
  loading: false,
  error: null,
  totalItems: 0,
  filters: {
    department: '',
    position: '',
    search: ''
  },
  currentPage: 1,
  perPage: 10
}

const getters = {
  allEmployees: state => state.employees,
  currentEmployee: state => state.currentEmployee,
  isLoading: state => state.loading,
  hasError: state => !!state.error,
  errorMessage: state => state.error,
  totalPages: state => Math.ceil(state.totalItems / state.perPage),
  filters: state => state.filters
}

const mutations = {
  SET_LOADING(state, status) {
    state.loading = status
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  SET_EMPLOYEES(state, { employees, total }) {
    state.employees = employees
    state.totalItems = total
  },
  SET_CURRENT_EMPLOYEE(state, employee) {
    state.currentEmployee = employee
  },
  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters }
  },
  SET_CURRENT_PAGE(state, page) {
    state.currentPage = page
  }
}

const actions = {
  // 직원 목록 조회 (더미 데이터 사용)
  async fetchEmployees({ commit, state }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      // 더미 데이터
      const dummyEmployees = [
        {
          id: 1,
          name: '김철수',
          department: 'DSS1',
          position: '과장',
          email: 'kim@company.com',
          phone: '010-1234-5678',
          address: '서울시 강남구',
          birth: '1985-05-15',
          photoUrl: null
        },
        {
          id: 2,
          name: '이영희',
          department: 'DSS2', 
          position: '대리',
          email: 'lee@company.com',
          phone: '010-9876-5432',
          address: '서울시 서초구',
          birth: '1990-08-22',
          photoUrl: null
        },
        {
          id: 3,
          name: '박민수',
          department: 'CSC',
          position: '차장',
          email: 'park@company.com',
          phone: '010-5555-1234',
          address: '서울시 송파구',
          birth: '1982-12-10',
          photoUrl: null
        },
        {
          id: 4,
          name: '최수진',
          department: 'HR',
          position: '부장',
          email: 'choi@company.com',
          phone: '010-7777-8888',
          address: '서울시 마포구',
          birth: '1978-03-05',
          photoUrl: null
        }
      ]
      
      // 필터링 적용
      let filteredEmployees = dummyEmployees
      const { department, position, search } = state.filters
      
      if (department) {
        filteredEmployees = filteredEmployees.filter(emp => emp.department === department)
      }
      if (position) {
        filteredEmployees = filteredEmployees.filter(emp => emp.position === position)
      }
      if (search) {
        filteredEmployees = filteredEmployees.filter(emp => 
          emp.name.includes(search) || emp.email.includes(search)
        )
      }
      
      commit('SET_EMPLOYEES', {
        employees: filteredEmployees,
        total: filteredEmployees.length
      })
    } catch (error) {
      commit('SET_ERROR', error.message || '직원 목록을 불러오는데 실패했습니다.')
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 직원 상세 조회 (더미 데이터 사용)
  async fetchEmployeeById({ commit }, id) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      // 더미 데이터 (기존과 동일)
      const dummyEmployees = [
        {
          id: 1,
          name: '김철수',
          department: 'DSS1',
          position: '과장',
          email: 'kim@company.com',
          phone: '010-1234-5678',
          address: '서울시 강남구 테헤란로 123',
          birth: '1985-05-15',
          photoUrl: null,
          career_years: 15.5,
          eus_career: '15년 6개월',
          workplace: '서울 본사',
          skills: 'Java, Spring, Vue.js',
          educations: [
            {
              school: '서울대학교',
              major: '컴퓨터공학',
              degree: '학사',
              startDate: '2004-03-01',
              endDate: '2008-02-28',
              grade: '3.8/4.5'
            }
          ],
          certificates: [
            {
              name: '정보처리기사',
              issuer: '한국산업인력공단',
              issueDate: '2007-06-15',
              expiryDate: '',
              score: '합격'
            }
          ],
          careers: [
            {
              company: 'ABC 시스템',
              department: '개발팀',
              position: '사원',
              startDate: '2008-03-01',
              endDate: '2012-02-28',
              duties: '웹 애플리케이션 개발'
            }
          ],
          projects: [
            {
              name: '직원관리시스템',
              client: '내부',
              role: '개발팀장',
              startDate: '2023-01-01',
              endDate: '2023-12-31',
              technologies: 'Vue.js, Node.js, MySQL',
              description: '사내 직원관리시스템 개발'
            }
          ]
        },
        {
          id: 2,
          name: '이영희',
          department: 'DSS2',
          position: '대리',
          email: 'lee@company.com',
          phone: '010-9876-5432',
          address: '서울시 서초구 강남대로 456',
          birth: '1990-08-22',
          photoUrl: null,
          career_years: 8.3,
          eus_career: '8년 4개월',
          workplace: '서울 본사',
          skills: 'Python, Django, React',
          educations: [],
          certificates: [],
          careers: [],
          projects: []
        },
        {
          id: 3,
          name: '박민수',
          department: 'CSC',
          position: '차장',
          email: 'park@company.com',
          phone: '010-5555-1234',
          address: '서울시 송파구 올림픽로 789',
          birth: '1982-12-10',
          photoUrl: null,
          career_years: 18.7,
          eus_career: '18년 8개월',
          workplace: '서울 본사',
          skills: '프로젝트 관리, 시스템 분석',
          educations: [
            {
              school: '연세대학교',
              major: '경영학',
              degree: '학사',
              startDate: '2001-03-01',
              endDate: '2005-02-28',
              grade: '3.5/4.5'
            }
          ],
          certificates: [
            {
              name: '컴활1급',
              issuer: '대한상공회의소',
              issueDate: '2005-05-20',
              expiryDate: '',
              score: '합격'
            }
          ],
          careers: [
            {
              company: 'XYZ 코퍼레이션',
              department: '기획팀',
              position: '주임',
              startDate: '2005-03-01',
              endDate: '2010-12-31',
              duties: '사업기획 및 분석'
            }
          ],
          projects: [
            {
              name: '시스템 통합 프로젝트',
              client: '외부 고객사',
              role: '프로젝트 매니저',
              startDate: '2022-01-01',
              endDate: '2022-12-31',
              technologies: 'Java, Oracle, Spring',
              description: '레거시 시스템 통합 프로젝트'
            }
          ]
        },
        {
          id: 4,
          name: '최수진',
          department: 'HR',
          position: '부장',
          email: 'choi@company.com',
          phone: '010-7777-8888',
          address: '서울시 마포구 홍대로 321',
          birth: '1978-03-05',
          photoUrl: null,
          career_years: 22.1,
          eus_career: '22년 1개월',
          workplace: '서울 본사',
          skills: '인사관리, 조직개발, 교육기획',
          educations: [
            {
              school: '고려대학교',
              major: '심리학',
              degree: '학사',
              startDate: '1997-03-01',
              endDate: '2001-02-28',
              grade: '3.9/4.5'
            },
            {
              school: '서울대학교',
              major: '인사조직학',
              degree: '석사',
              startDate: '2001-09-01',
              endDate: '2003-08-31',
              grade: '4.2/4.5'
            }
          ],
          certificates: [
            {
              name: '인사관리사',
              issuer: '한국산업인력공단',
              issueDate: '2003-11-15',
              expiryDate: '',
              score: '합격'
            },
            {
              name: 'TOEIC',
              issuer: 'ETS',
              issueDate: '2023-01-15',
              expiryDate: '2025-01-15',
              score: '950'
            }
          ],
          careers: [
            {
              company: 'DEF 인터내셔널',
              department: '인사팀',
              position: '대리',
              startDate: '2003-09-01',
              endDate: '2008-02-28',
              duties: '채용 및 교육 업무'
            },
            {
              company: 'GHI 그룹',
              department: '인사팀',
              position: '과장',
              startDate: '2008-03-01',
              endDate: '2015-12-31',
              duties: '인사기획 및 조직관리'
            }
          ],
          projects: [
            {
              name: 'HR 시스템 구축',
              client: '내부',
              role: '프로젝트 오너',
              startDate: '2023-03-01',
              endDate: '2023-11-30',
              technologies: 'SAP, Oracle',
              description: '통합 인사관리시스템 구축'
            },
            {
              name: '조직문화 개선 프로젝트',
              client: '내부',
              role: '팀리더',
              startDate: '2022-06-01',
              endDate: '2022-12-31',
              technologies: 'Survey Tools, Analytics',
              description: '직원 만족도 조사 및 조직문화 개선'
            }
          ]
        }
      ]
      
      const employee = dummyEmployees.find(emp => emp.id === parseInt(id))
      
      if (employee) {
        commit('SET_CURRENT_EMPLOYEE', employee)
      } else {
        throw new Error('직원 정보를 찾을 수 없습니다.')
      }
    } catch (error) {
      commit('SET_ERROR', error.message || '직원 정보를 불러오는데 실패했습니다.')
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 기타 액션들 (임시 구현)
  async createEmployee({ commit, dispatch }, employeeData) {
    // 임시 구현
    return { success: true, data: employeeData }
  },
  
  async updateEmployee({ commit, dispatch }, { id, data }) {
    // 임시 구현
    return { success: true, data }
  },
  
  async deleteEmployee({ commit, dispatch }, id) {
    // 임시 구현
    return { success: true }
  },
  
  setFilters({ commit }, filters) {
    commit('SET_FILTERS', filters)
  },
  
  setCurrentPage({ commit }, page) {
    commit('SET_CURRENT_PAGE', page)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
