<template>
  <div class="resume-bg">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading-container">

      <div class="loading-spinner"></div>
      <p>직원 정보를 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="hasError" class="error-container">
      <div class="error-message">
        <h3>오류 발생</h3>
        <p><strong>에러 메시지:</strong> {{ errorMessage }}</p>
        <p><strong>디버그 정보:</strong> {{ debugInfo }}</p>
      </div>
      <button class="btn btn-primary" @click="retryLoad">다시 시도</button>
    </div>

    <!-- 직원 정보가 없을 때 -->
    <div v-else-if="!employee" class="error-container">
      <div class="error-message">직원 정보를 찾을 수 없습니다.</div>
      <router-link to="/employee-list" class="btn btn-primary">목록으로 돌아가기</router-link>
    </div>

    <!-- 직원 정보 표시 -->
    <div class="resume-container resume-container-relative" id="employeeDetailContainer" v-else>
      <!-- 상단 바: DetailHeader 컴포넌트 복원 -->
      <DetailHeader
        :edit-mode="editMode"
        :is-add-mode="isAddMode"
        :current-user="currentUser"
        :search-error="searchError"
        @search="searchEmployee"
        @toggle-edit="toggleEditMode"
        @save="saveDetail"
        @cancel-edit="cancelEdit"
        @logout="logout"
        @delete="deleteEmployee"
      />

      <!-- 메시지 표시 -->
      <div class="message-container" v-if="message.text">
        <div class="message-content" :class="message.type">{{ message.text }}</div>
      </div>

      <div class="resume-content" :class="{ 'fade-in': showFadeIn }" :style="!showFadeIn ? 'opacity:0' : ''">
        <!-- 좌측 영역 - 직원 정보 및 테이블들 -->
        <div class="resume-left">
          <!-- 프로필+기본정보+연락처를 하나의 카드로 묶음 -->
          <div class="profile-card">
            <BasicInfo
              :employee="employee"
              :edit-mode="editMode"
              :errors="errors"
              @update:employee="updateEmployee"
              @photo-change="onPhotoChange"
              @validate-field="validateField"
              @career-change="onCareerChange"
              :key="'basic-' + editMode"
            />
            <div class="divider"></div>
            <ContactInfo
              :employee="employee"
              :edit-mode="editMode"
              :errors="errors"
              @update:employee="updateEmployee"
              @validate-field="validateField"
              :key="'contact-' + editMode"
            />
          </div>

          <!-- 학력 테이블 -->
          <div class="section-block">
            <EducationTable
              class="table-container"
              :employee="employee"
              :edit-mode="editMode"
              :errors="errors"
              @update:employee="updateEmployee"
              :key="'edu'"
            />
          </div>

          <!-- 자격증 테이블 -->
          <div class="section-block">
            <CertificationTable
              class="table-container"
              :employee="employee"
              :edit-mode="editMode"
              :errors="errors"
              @update:employee="updateEmployee"
              :key="'cert'"
            />
          </div>

          <!-- 경력사항 테이블 -->
          <div class="section-block">
            <CareerTable
              class="table-container"
              :employee="employee"
              :edit-mode="editMode"
              :errors="errors"
              @update:employee="updateEmployee"
              @career-change="onCareerChange"
              :key="'career'"
            />
          </div>

          <!-- 프로젝트 테이블 -->
          <div class="section-block">
            <ExternalProjectTable
              class="table-container"
              :employee="employee"
              :edit-mode="editMode"
              :errors="errors"
              @update:employee="updateEmployee"
              :key="'proj'"
            />
          </div>
        </div>

        <!-- 우측 영역 - 차트 및 기술 점수 -->
        <div class="resume-right">


          <!-- 기술 역량 차트 + 기간별 기술 역량 분석 이동 버튼 -->
          <SkillChart
            class="table-container"
            :employee="employee"
            :edit-mode="editMode"
            @update:employee="updateEmployee"
            @go-to-period-analysis="goToPerformanceAnalysis"
            :key="'skill'"
          />

          <!-- 기간별 성과 분석(기존) -->
          <PeriodSelector
            class="table-container"
            :employee="employee"
            @generate-report="onGenerateReport"
          />
        </div>
      </div>
    </div>
  </div>
  <!-- ToastConfirm: 삭제/로그아웃 등 확인용 -->
  <ToastConfirm
    :visible="showConfirm"
    :message="confirmMessage"
    @confirm="onConfirmToast"
    @cancel="onCancelToast"
  />
</template>

<script>
import BasicInfo from '@/components/employee/detail/BasicInfo.vue';
import ContactInfo from '@/components/employee/detail/ContactInfo.vue';
import SkillChart from '@/components/employee/detail/SkillChart.vue';
import PeriodSelector from '@/components/employee/detail/PeriodSelector.vue';
import EmployeeApiService from '@/services/EmployeeApiService';
import DetailHeader from '@/components/employee/detail/DetailHeader.vue';
import EducationTable from '@/components/employee/detail/EducationTable.vue';
import CareerTable from '@/components/employee/detail/CareerTable.vue';
import CertificationTable from '@/components/employee/detail/CertificationTable.vue';
import ExternalProjectTable from '@/components/employee/detail/ExternalProjectTable.vue';
import ToastConfirm from '@/components/common/ToastConfirm.vue';

export default {
  name: 'EmployeeDetail',
  components: {
    ToastConfirm,
    BasicInfo,
    ContactInfo,
    SkillChart,
    PeriodSelector,
    EducationTable,
    CareerTable,
    CertificationTable,
    ExternalProjectTable,
    DetailHeader,
  },
  data() {
    return {
      searchQuery: '',
      employee: {
        id: null,
        name: '',
        birth_date: '',
        department: '',
        position: '',
        hire_date: '',
        mitmas_career: '',
        total_career: '',
        email: '',
        phone: '',
        address: '',
        workplace: '',
        skills: '',
        photo: null,
        educations: [],
        careers: [],
        certifications: [],
        external_projects: [],
      },
      showFadeIn: false,
      editMode: false,
      isAddMode: false,
      isLoading: false,
      hasError: false,
      errorMessage: '',
      debugInfo: '',
      message: { text: '', type: '' },
      errors: {},
      searchError: '',
      currentUser: JSON.parse(localStorage.getItem('currentUser') || '{}'),
      originalEmployee: null,
      // ToastConfirm 관련 상태
      showConfirm: false,
      confirmMessage: '',
      confirmAction: null,
      // 평가 이력 상태 제거
    };
  },
  computed: {
    employeeId() {
      return this.$route.params.id;
    },
    isValidEmployee() {
      return this.employee && this.employee.name && this.employee.name.trim() !== '';
    },
    // 총 경력: mitmas 총 경력(개월) + 경력사항 개월수
    totalCareerMonths() {
      // mitmas_career: 년.월 또는 개월(숫자)로 입력될 수 있음
      let mitmasMonths = 0;
      const mitmas = this.employee.mitmas_career;
      if (mitmas) {
        if (typeof mitmas === 'number') {
          mitmasMonths = mitmas;
        } else if (typeof mitmas === 'string') {
          // "2년 3개월", "27개월", "2.3" 등 다양한 형태 지원
          const yearMonthMatch = mitmas.match(/(\d+)년\s*(\d+)?개월?/);
          if (yearMonthMatch) {
            mitmasMonths = Number(yearMonthMatch[1]) * 12 + Number(yearMonthMatch[2] || 0);
          } else if (/개월/.test(mitmas)) {
            const m = mitmas.match(/(\d+)/);
            if (m) mitmasMonths = Number(m[1]);
          } else if (/\d+\.\d+/.test(mitmas)) {
            // "2.3" → 2년 3개월
            const [y, m] = mitmas.split('.').map(Number);
            mitmasMonths = y * 12 + (m || 0);
          } else if (/\d+/.test(mitmas)) {
            mitmasMonths = Number(mitmas);
          }
        }
      }
      // 경력사항 개월수 합산
      let careerMonths = 0;
      if (Array.isArray(this.employee.careers)) {
        careerMonths = this.employee.careers.reduce((sum, c) => {
          const start = c.period_start || c.startDate;
          const end = c.period_end || c.endDate;
          if (!start) return sum;
          const startDate = new Date(start);
          const endDate = end ? new Date(end) : new Date();
          if (isNaN(startDate.getTime())) return sum;
          if (isNaN(endDate.getTime())) return sum;
          let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
          months += endDate.getMonth() - startDate.getMonth();
          if (endDate.getDate() < startDate.getDate()) months--;
          return sum + (months >= 0 ? months + 1 : 0);
        }, 0);
      }
      return mitmasMonths + careerMonths;
    },
  },
  created() {
    if (this.employeeId === 'new') {
      this.isAddMode = true;
      this.editMode = true;
      this.initializeNewEmployee();
    } else {
      this.loadEmployee();
    }
  },
  watch: {
    // ...existing code...
    '$route.params.id'(newId, oldId) {
      if (newId !== oldId) {
        if (newId === 'new') {
          this.isAddMode = true;
          this.editMode = true;
          this.initializeNewEmployee();
        } else {
          this.isAddMode = false;
          this.editMode = false;
          this.loadEmployee();
        }
      }
    }
  },
  methods: {
    deleteEmployee() {
      this.confirmMessage = '정말로 이 직원을 삭제하시겠습니까?';
      this.confirmAction = async () => {
        try {
          const result = await EmployeeApiService.deleteEmployee(this.employee.id);
          if (result.success) {
            this.showMessage('직원 정보가 삭제되었습니다.', 'success');
            this.$router.push('/employee-list');
          } else {
            this.showMessage(result.error || '삭제에 실패했습니다.', 'error');
          }
        } catch (error) {
          this.showMessage(error.message || '삭제 중 오류가 발생했습니다.', 'error');
        }
        this.showConfirm = false;
      };
      this.showConfirm = true;
    },
    // 날짜 필드 전처리: 빈 문자열, 'Invalid date'를 null로 변환
    sanitizeDate(val) {
      if (!val || val === 'Invalid date' || val === undefined) return null;
      return val;
    },
    // 서브테이블이 완전히 비어있는지 확인하는 함수 (명시적 키 배열 사용)
    isSubTableEmpty(arr, keys) {
      if (!Array.isArray(arr) || arr.length === 0) return true;
      return arr.every(row => keys.every(key => !row[key] || row[key] === ''));
    },
    // 배열의 기간 필드 일괄 전처리 (필드명 배열로 지정)
    sanitizePeriodFields(arr, periodKeys = ['period_start', 'period_end']) {
      if (!Array.isArray(arr)) return arr;
      return arr.map(item => {
        const sanitized = { ...item };
        periodKeys.forEach(key => {
          if (key in sanitized) {
            sanitized[key] = this.sanitizeDate(sanitized[key]);
            if (sanitized[key] === null) {
              delete sanitized[key]; // null이면 필드 삭제
            }
          }
        });
        return sanitized;
      });
    },
    // 기간 기본값(최근 1년)
    getDefaultFrom() {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth() - 11, 1)
        .toISOString()
        .slice(0, 7);
      return from;
    },
    getDefaultTo() {
      const now = new Date();
      return now.toISOString().slice(0, 7);
    },

    // 개별 필드 유효성 검사 (하위 컴포넌트에서 호출)
    validateField(field, value) {
      // errors 객체를 복사해서 사용
      const errors = { ...this.errors };
      switch (field) {
        case 'name':
          if (!value || !this.isValidName(value)) {
            errors.name = '성명을 올바르게 입력하세요. (한글 2~4자 또는 영문 2~20자)';
          } else {
            delete errors.name;
          }
          break;
        case 'birth_date':
          if (!value) {
            errors.birth_date = '생년월일을 선택해주세요.';
          } else {
            delete errors.birth_date;
          }
          break;
        case 'department':
          if (!value) {
            errors.department = '부서를 선택해주세요.';
          } else {
            delete errors.department;
          }
          break;
        case 'position':
          if (!value) {
            errors.position = '직급을 선택해주세요.';
          } else {
            delete errors.position;
          }
          break;
        case 'hire_date':
          if (!value) {
            errors.hire_date = '입사일을 선택해주세요.';
          } else {
            delete errors.hire_date;
          }
          break;
        case 'email':
          if (value && !this.isValidEmail(value)) {
            errors.email = '올바른 이메일 형식을 입력하세요.';
          } else {
            delete errors.email;
          }
          break;
        case 'phone':
          if (value && !this.isValidPhone(value)) {
            errors.phone = '올바른 전화번호를 입력하세요. (10-11자리 숫자)';
          } else {
            delete errors.phone;
          }
          break;
        case 'address':
          if (value && value.length < 5) {
            errors.address = '주소는 5글자 이상 입력하세요.';
          } else {
            delete errors.address;
          }
          break;
        // 필요시 추가 필드별 유효성 검사
      }
      this.errors = errors;
    },

    // 직원 데이터 로드
    async loadEmployee() {
      if (!this.employeeId || this.employeeId === 'new') return;

      this.isLoading = true;
      this.hasError = false;

      try {
        const response = await EmployeeApiService.getEmployeeById(this.employeeId);
        if (response.success) {
          this.employee = {
            ...this.employee,
            ...response.data,
            certifications: response.data.certifications || [],
            external_projects: response.data.external_projects || [],
          };
          this.originalEmployee = JSON.parse(JSON.stringify(this.employee));
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        this.hasError = true;
        this.errorMessage = error.message || '직원 정보를 불러오는데 실패했습니다.';
        this.debugInfo = `ID: ${this.employeeId}, Error: ${error.toString()}`;
      } finally {
        this.isLoading = false;
      }
    },

    // 새 직원 초기화
    initializeNewEmployee() {
      this.employee = {
        id: null,
        name: '',
        birth_date: '',
        department: '',
        position: '',
        hire_date: '',
        mitmas_career: '',
        total_career: '',
        email: '',
        phone: '',
        address: '',
        workplace: '',
        skills: '',
        photo: null,
        educations: [],
        careers: [],
        certifications: [],
        external_projects: [],
      };
    },

    // 직원 검색
    async searchEmployee(employeeId) {
      if (!employeeId) {
        this.searchError = '사원번호를 입력해주세요.';
        return;
      }

      try {
        this.searchError = '';
        const response = await EmployeeApiService.getEmployeeById(employeeId);
        if (response.success) {
          this.$router.push(`/employee-detail/${employeeId}`);
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        this.searchError = '해당 사원번호의 직원을 찾을 수 없습니다.';
      }
    },

    // 상단바 검색
    onSearch() {
      this.$emit('search', this.searchQuery);
    },

    // 편집 모드 토글
    toggleEditMode() {
      if (this.editMode) {
        this.cancelEdit();
      } else {
        this.editMode = true;
        this.originalEmployee = JSON.parse(JSON.stringify(this.employee));
      }
    },

    // 편집 취소
    cancelEdit() {
      if (this.isAddMode) {
        this.$router.push('/employee-list');
      } else {
        this.employee = JSON.parse(JSON.stringify(this.originalEmployee));
        this.editMode = false;
        this.errors = {};
        this.clearMessage();
      }
    },

    // 직원 정보 저장
    async saveDetail() {
      if (!this.validateForm()) {
        this.showMessage('입력 정보를 확인해주세요.', 'error');
        return;
      }
      // skillScores/leaderSkillScores를 score1~score6, leader_score1~6으로 변환
      const toScoreFields = (arr, prefix = 'score') => {
        const obj = {};
        if (Array.isArray(arr) && arr.length === 6) {
          arr.forEach((v, i) => {
            obj[`${prefix}${i+1}`] = Number(v);
          });
        }
        return obj;
      };
      // payload에서 skillScores, leaderSkillScores, certifications, externalProjects만 분리, 나머지 서브테이블은 포함
      const {
        skillScores, leaderSkillScores, certifications, external_projects,
        ...baseFields
      } = this.employee;
      const forbidden = ['id', 'photo', 'photoUrl', 'eus_career'];
      const payload = {};
      Object.entries(baseFields).forEach(([k, v]) => {
        if (!forbidden.includes(k) && v !== undefined && v !== null) payload[k] = v;
      });
      // 서브테이블 배열 DB/백엔드 필드명에 맞게 변환
      // 서브테이블별 키 배열 정의
      const educationKeys = ['school_name', 'major', 'period_start', 'period_end'];
      const careerKeys = ['company_name', 'position', 'period_start', 'period_end', 'department', 'responsibilities'];
      const certificationKeys = ['cert_name', 'cert_organization', 'cert_number', 'acquisition_date'];
      const externalProjectKeys = ['project_name', 'period_start', 'period_end', 'role', 'project_description'];

      if (this.employee.educations) {
        const mapped = this.employee.educations.map(e => ({
          school_name: e.school || e.school_name || '',
          major: e.major || '',
          period_start: e.startDate || e.period_start || '',
          period_end: e.endDate || e.period_end || ''
        }));
        // 모든 필드가 비어있지 않은 행만 필터링
        const filtered = mapped.filter(row => !this.isSubTableEmpty([row], educationKeys));
        if (filtered.length > 0) {
          payload.educations = this.sanitizePeriodFields(filtered, ['period_start', 'period_end']);
        }
      }
      if (this.employee.careers) {
        const mapped = this.employee.careers.map(c => ({
          company_name: c.company_name || c.company || '',
          position: c.position || '',
          period_start: c.startDate || c.period_start || '',
          period_end: c.endDate || c.period_end || '',
          department: c.department || '',
          responsibilities: c.responsibilities || c.duties || ''
        }));
        const filtered = mapped.filter(row => !this.isSubTableEmpty([row], careerKeys));
        if (filtered.length > 0) {
          payload.careers = this.sanitizePeriodFields(filtered, ['period_start', 'period_end']);
        }
      }
      if (this.employee.certifications) {
        const mapped = this.employee.certifications.map(cert => ({
          cert_name: cert.certification_name || cert.cert_name || '',
          cert_organization: cert.issuing_authority || cert.cert_organization || '',
          cert_number: cert.cert_number || '',
          acquisition_date: cert.acquisition_date || ''
        }));
        const filtered = mapped.filter(row => !this.isSubTableEmpty([row], certificationKeys));
        if (filtered.length > 0) {
          payload.certifications = this.sanitizePeriodFields(filtered, ['acquisition_date']);
        }
      }
      if (this.employee.external_projects) {
        const mapped = this.employee.external_projects.map(p => ({
          project_name: p.project_name || p.name || '',
          period_start: p.startDate || p.period_start || '',
          period_end: p.endDate || p.period_end || '',
          project_description: p.technologies || p.project_description || '',
          role: p.role || ''
        }));
        const filtered = mapped.filter(row => !this.isSubTableEmpty([row], externalProjectKeys));
        if (filtered.length > 0) {
          payload.external_projects = this.sanitizePeriodFields(filtered, ['period_start', 'period_end']);
        }
      }
      // score1~6, leader_score1~6 변환 추가
      if (skillScores && Array.isArray(skillScores) && skillScores.length === 6) {
        Object.assign(payload, toScoreFields(skillScores, 'score'));
      }
      if (leaderSkillScores && Array.isArray(leaderSkillScores) && leaderSkillScores.length === 6) {
        Object.assign(payload, toScoreFields(leaderSkillScores, 'leader_score'));
      }
      try {
        let result;
        if (this.isAddMode) {
          result = await EmployeeApiService.createEmployee(payload);
          if (result.success) {
            this.showMessage('직원 정보가 성공적으로 등록되었습니다.', 'success');
            this.$router.push(`/employee-detail/${result.data.id}`);
            // 등록 후 최신 데이터 fetch
            this.loadEmployee();
          } else {
            throw new Error(result.error);
          }
        } else {
          result = await EmployeeApiService.updateEmployee(this.employeeId, payload);
          if (result.success) {
            this.showMessage('직원 정보가 성공적으로 수정되었습니다.', 'success');
            this.originalEmployee = JSON.parse(JSON.stringify(this.employee));
            this.editMode = false;
            this.errors = {};
            // 수정 후 최신 데이터 fetch
            this.loadEmployee();
          } else {
            throw new Error(result.error);
          }
        }
      } catch (error) {
        this.showMessage(error.message || '저장에 실패했습니다.', 'error');
      }
    },
    // 자식 컴포넌트에서 update:employee 이벤트를 받을 때 employee 객체 전체 로그
    updateEmployee(newEmployee) {
      // 배열 필드는 항상 새 배열로 할당하여 반응성 보장
      this.employee = {
        ...this.employee,
        ...newEmployee,
        educations: Array.isArray(newEmployee.educations)
          ? JSON.parse(JSON.stringify(newEmployee.educations))
          : (this.employee.educations || []),
        careers: Array.isArray(newEmployee.careers)
          ? JSON.parse(JSON.stringify(newEmployee.careers))
          : (this.employee.careers || []),
        certifications: Array.isArray(newEmployee.certifications)
          ? JSON.parse(JSON.stringify(newEmployee.certifications))
          : (this.employee.certifications || []),
        external_projects: Array.isArray(newEmployee.external_projects)
          ? JSON.parse(JSON.stringify(newEmployee.external_projects))
          : (this.employee.external_projects || []),
      };
    },
    // ...existing code...
    onPhotoChange(photoData) {
      this.employee.photo = photoData;
    },
    onCareerChange(newCareers) {
      // 경력 변경 시 employee.careers를 새 배열로 할당하여 반응성 보장
      this.employee = {
        ...this.employee,
        careers: Array.isArray(newCareers) ? JSON.parse(JSON.stringify(newCareers)) : [],
      };
    },
    addEducation() {
      if (!this.employee.educations) {
        this.employee.educations = [];
      }
      this.employee.educations.push({
        school_name: '',
        major: '',
        period_start: '',
        period_end: '',
      });
    },
    removeEducation(index) {
      this.employee.educations.splice(index, 1);
    },
    addCareer() {
      if (!this.employee.careers) {
        this.employee.careers = [];
      }
      this.employee.careers.push({
        company_name: '',
        position: '',
        period_start: '',
        period_end: '',
        department: '',
        responsibilities: '',
      });
    },
    removeCareer(index) {
      this.employee.careers.splice(index, 1);
    },
    addCertifications() {
      if (!this.employee.certifications) {
        this.employee.certifications = [];
      }
      this.employee.certifications.push({
        cert_name: '',
        cert_organization: '',
        cert_number: '',
        acquisition_date: '',
      });
    },
    removeCertifications(index) {
      this.employee.certifications.splice(index, 1);
    },
    addexternalProject() {
      if (!this.employee.external_projects) {
        this.employee.external_projects = [];
      }
      this.employee.external_projects.push({
        project_name: '',
        period_start: '',
        period_end: '',
        role: '',
        project_description: '',
      });
    },
    removeexternalProject(index) {
      this.employee.external_projects.splice(index, 1);
    },
    showMessage(text, type = 'info') {
      this.message = { text, type };
      setTimeout(() => {
        this.clearMessage();
      }, 5000);
    },
    clearMessage() {
      this.message = { text: '', type: '' };
    },
    retryLoad() {
      this.loadEmployee();
    },
    logout() {
      this.confirmMessage = '로그아웃 하시겠습니까?';
      this.confirmAction = this.confirmLogout;
      this.showConfirm = true;
    },
    confirmLogout() {
      this.$store.dispatch('auth/logout');
      this.showConfirm = false;
    },
    onConfirmToast() {
      if (typeof this.confirmAction === 'function') {
        this.confirmAction();
      }
    },
    onCancelToast() {
      this.showConfirm = false;
    },
    onGenerateReport(reportData) {
      this.showMessage(`${reportData.employee.name}의 성과 리포트가 생성되었습니다.`, 'success');
    },

    // ===== 상세페이지 유효성 검사 =====
    validateForm() {
      this.errors = {};
      let isValid = true;
      // 1. 성명
      if (!this.employee.name || !this.isValidName(this.employee.name)) {
        this.errors.name = '성명을 올바르게 입력하세요. (한글 2~4자 또는 영문 2~20자)';
        isValid = false;
      }
      // 2. 생년월일
      if (!this.employee.birth_date) {
        this.errors.birth_date = '생년월일을 선택해주세요.';
        isValid = false;
      }
      // 3. 부서
      if (!this.employee.department) {
        this.errors.department = '부서를 선택해주세요.';
        isValid = false;
      }
      // 4. 직급
      if (!this.employee.position) {
        this.errors.position = '직급을 선택해주세요.';
        isValid = false;
      }
      // 5. 입사일
      if (!this.employee.hire_date) {
        this.errors.hire_date = '입사일을 선택해주세요.';
        isValid = false;
      }
      // 6. 이메일(선택)
      if (this.employee.email && !this.isValidEmail(this.employee.email)) {
        this.errors.email = '올바른 이메일 형식을 입력하세요.';
        isValid = false;
      }
      // 7. 전화번호(선택)
      if (this.employee.phone && !this.isValidPhone(this.employee.phone)) {
        this.errors.phone = '올바른 전화번호를 입력하세요. (10-11자리 숫자)';
        isValid = false;
      }
      // 8. 주소(선택)
      if (this.employee.address && this.employee.address.length < 5) {
        this.errors.address = '주소는 5글자 이상 입력하세요.';
        isValid = false;
      }
      // 9. 점수(1~5)
      const scoreFields = ['score1','score2','score3','score4','score5','score6'];
      if (this.employee.scores) {
        scoreFields.forEach(field => {
          const val = Number(this.employee.scores[field]);
          if (val && (val < 1 || val > 5)) {
            this.errors[field] = '점수는 1~5 사이여야 합니다.';
            isValid = false;
          }
        });
      }
      // 10. 학력/경력/프로젝트/자격증: 기간 입력은 완전 선택사항(입력 안 해도 통과, 시작기간 없어도 통과)
      // (아래 블록 전체 제거)
      return isValid;
    },

    isValidName(name) {
      if (!name || typeof name !== 'string') return false;
      const trimmed = name.trim();
      if (trimmed.length < 2) return false;
      const mixedRegex = /^[가-힣a-zA-Z\s]{2,20}$/;
      const consonantRegex = /^[ㄱ-ㅎ]+$/;
      if (consonantRegex.test(trimmed)) return false;
      return mixedRegex.test(trimmed);
    },
    isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    isValidPhone(phone) {
      if (!phone || typeof phone !== 'string') return false;
      const cleaned = phone.replace(/[^\d]/g, '');
      if (cleaned.length < 10 || cleaned.length > 11) return false;
      const validPrefixes = ['010','011','016','017','018','019'];
      return validPrefixes.includes(cleaned.substring(0,3));
    },
    validateYearMonth(val) {
      // YYYY-MM 또는 YYYY.MM 또는 YYYY/MM
      return /^\d{4}[-./]\d{2}$/.test(val);
    },

    goToPerformanceAnalysis() {
      if (this.employee && this.employee.id) {
        this.$router.push(`/performance-analysis/${this.employee.id}`);
      } else {
        this.showMessage('직원 정보가 없습니다.', 'error');
      }
    },
  },
  mounted() {
    // 마운트 후 추가 작업이 필요하면 여기에 구현
    setTimeout(() => {
      this.showFadeIn = true;
    }, 10);
  },
};
</script>

<style scoped>
/* 공통 스타일은 아래 css 파일에서 import됨
   - src/assets/css/buttons.css
   - src/assets/css/employee-list/index.css
   - src/assets/css/employee-list/colors.css
   - src/assets/css/employee-list/responsive.css
*/

/* ===== 상세페이지 특화 레이아웃 ===== */
.resume-bg {
  min-height: 100vh;
  padding: 20px;
}

.resume-container {
  max-width: 1800px;
  margin: 0 auto;
  background: #f8f9fa;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.resume-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}


/* PC: 2:1 비율 고정 */
.resume-content {
  display: grid;
  grid-template-columns: 2fr 1.3fr;
  gap: 30px;
  padding: 30px;
  min-height: 600px;
}

.resume-left {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* 오른쪽 영역 min/max-width 별도 부여 */
.resume-right {
  display: flex;
  flex-direction: column;
  gap: 30px;
  min-width: 320px;
  max-width: 700px;
}

/* ===== 로딩/에러/메시지 컨테이너 ===== */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container .error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  margin-bottom: 20px;
}

.error-container .error-message h3 {
  margin-top: 0;
}

.message-container {
  padding: 0 20px 20px;
}

.message-content {
  padding: 12px 20px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  transition: all 0.3s ease;
}

.message-content.success {
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message-content.error {
  background: linear-gradient(135deg, #f8d7da, #f5c6cb);
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* ===== 애니메이션 ===== */
.resume-content {
  animation: fadeInUp 0.6s ease-out;
}

.table-container {
  animation: none !important; /* employee-list animation.css의 .table-container 애니메이션을 상세페이지에서 완전히 차단 */
} 


/* ===== 스크롤바/인쇄 등 기타 ===== */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #007bff, #6f42c1); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: linear-gradient(135deg, #0056b3, #5a2d91); }

@media print {
  .resume-bg { background: white !important; padding: 0; }
  .resume-container { box-shadow: none; border-radius: 0; }
  .btn { display: none; }
  .add-row-container { display: none; }
}
/* ===== 상단 프로필+기본+연락처 카드 강조 ===== */
.profile-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  padding: 32px 36px 24px 36px;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  border: 1.5px solid #e6e6e6;
  position: relative;
}
.profile-card .divider {
  height: 1px;
  background: linear-gradient(90deg, #e6e6e6 0%, #f5f5f5 100%);
  margin: 10px 0 0 0;
  border: none;
}
@media (max-width: 900px) {
  .profile-card {
    padding: 18px 8vw 14px 8vw;
  }
}


/* 반응형: 1400px 이하(차트/테이블 세로 정렬) */
@media (max-width: 1400px) {
  .resume-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    min-height: unset;
  }
  .resume-left, .resume-right {
    gap: 16px;
  }
  .resume-container {
    padding: 0 4px;
  }
  .resume-right {
    min-width: 0;
    max-width: 100%;
  }
}
/* 반응형: 900px 이하(모바일/태블릿) */
@media (max-width: 900px) {
  .resume-content {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 4px;
    min-height: unset;
  }
  .resume-left, .resume-right {
    gap: 10px;
  }
  .profile-card {
    padding: 10px 4vw 8px 4vw;
    margin-bottom: 12px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .section-title {
    font-size: 15px;
    margin-bottom: 6px;
    padding-bottom: 4px;
  }
  .table-container, .skill-chart-container {
    padding: 10px 4px 8px 4px;
    margin-bottom: 10px;
    border-radius: 8px;
    min-width: 0;
    overflow-x: auto;
  }
  .btn, .btn-primary, .btn-secondary {
    font-size: 13px;
    padding: 6px 10px;
    border-radius: 4px;
  }
  .score-display {
    font-size: 12px;
    padding: 2px 6px;
    min-width: 36px;
  }
}
/* 반응형: 600px 이하(모바일) */
@media (max-width: 600px) {
  .resume-content {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 2px;
    min-height: unset;
  }
  .resume-left, .resume-right {
    gap: 6px;
  }
  .profile-card {
    padding: 6px 2vw 4px 2vw;
    margin-bottom: 6px;
    border-radius: 6px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .section-title {
    font-size: 13px;
    margin-bottom: 3px;
    padding-bottom: 2px;
  }
  .table-container, .skill-chart-container {
    padding: 4px 2px 4px 2px;
    margin-bottom: 6px;
    border-radius: 6px;
    min-width: 0;
    overflow-x: auto;
  }
  .btn, .btn-primary, .btn-secondary {
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 3px;
  }
  .score-display {
    font-size: 11px;
    padding: 1px 4px;
    min-width: 28px;
  }
}

</style>
