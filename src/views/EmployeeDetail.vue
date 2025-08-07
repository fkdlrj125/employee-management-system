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
      <!-- 상단 바: EmployeeDetailHeader 컴포넌트 복원 -->
      <EmployeeDetailHeader
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

      <div class="resume-content">
        <!-- 좌측 영역 - 직원 정보 및 테이블들 -->
        <div class="resume-left">
          <!-- 프로필+기본정보+연락처를 하나의 카드로 묶음 -->
          <div class="table-container">
          <EmployeeBasicInfo
            :employee="employee"
            :edit-mode="editMode"
            :errors="errors"
            @update:employee="updateEmployee"
            @photo-change="onPhotoChange"
            @validate-field="validateField"
            @career-change="onCareerChange"
            :key="'basic-' + editMode"
          />
          <EmployeeContactInfo
            :employee="employee"
            :edit-mode="editMode"
            :errors="errors"
            @update:employee="updateEmployee"
            @validate-field="validateField"
            :key="'contact-' + editMode"
          />
          </div>

          <!-- 학력 테이블 -->
          <EducationTable
            class="table-container"
            :employee="employee"
            :edit-mode="editMode"
            @update:employee="updateEmployee"
            :key="'edu-' + editMode"
          />

          <!-- 자격증 테이블 -->
          <CertificateTable
            class="table-container"
            :employee="employee"
            :edit-mode="editMode"
            @update:employee="updateEmployee"
            :key="'cert-' + editMode"
          />

          <!-- 경력사항 테이블 -->
          <CareerTable
            class="table-container"
            :employee="employee"
            :edit-mode="editMode"
            @update:employee="updateEmployee"
            :key="'career-' + editMode"
          />

          <!-- 프로젝트 테이블 -->
          <ProjectTable
            class="table-container"
            :employee="employee"
            :edit-mode="editMode"
            @update:employee="updateEmployee"
            :key="'proj-' + editMode"
          />
        </div>

        <!-- 우측 영역 - 차트 및 기술 점수 -->
        <div class="resume-right">
          <!-- 기술 역량 차트 -->
          <EmployeeSkillChart
            class="table-container"
            :employee="employee"
            :edit-mode="editMode"
            @update:employee="updateEmployee"
            :key="'skill-' + editMode"
          />

          <!-- 기간별 성과 분석 -->
          <EmployeePeriodSelector
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
import EmployeeBasicInfo from '@/components/employee/detail/EmployeeBasicInfo.vue';
import EmployeeContactInfo from '@/components/employee/detail/EmployeeContactInfo.vue';
import EmployeeSkillChart from '@/components/employee/detail/EmployeeSkillChart.vue';
import EmployeePeriodSelector from '@/components/employee/detail/EmployeePeriodSelector.vue';
import EmployeeApiService from '@/services/EmployeeApiService';
import EmployeeDetailHeader from '@/components/employee/detail/EmployeeDetailHeader.vue';
import EducationTable from '@/components/employee/detail/EducationTable.vue';
import CareerTable from '@/components/employee/detail/CareerTable.vue';
import CertificateTable from '@/components/employee/detail/CertificateTable.vue';
import ProjectTable from '@/components/employee/detail/ProjectTable.vue';

import ToastConfirm from '@/components/common/ToastConfirm.vue';

export default {
  name: 'EmployeeDetail',
  components: {
    EmployeeBasicInfo,
    EmployeeContactInfo,
    EmployeeSkillChart,
    EmployeePeriodSelector,
    EducationTable,
    CareerTable,
    CertificateTable,
    ProjectTable,
    EmployeeDetailHeader,
  },
  components: {
    ToastConfirm,
    EmployeeBasicInfo,
    EmployeeContactInfo,
    EmployeeSkillChart,
    EmployeePeriodSelector,
    EducationTable,
    CareerTable,
    CertificateTable,
    ProjectTable,
    EmployeeDetailHeader,
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
        certificates: [],
        projects: [],
      },
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
    };
  },
  computed: {
    employeeId() {
      return this.$route.params.id;
    },
    isValidEmployee() {
      return this.employee && this.employee.name && this.employee.name.trim() !== '';
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
    // 직원 데이터 로드
    async loadEmployee() {
      if (!this.employeeId || this.employeeId === 'new') return;

      this.isLoading = true;
      this.hasError = false;

      try {
        const response = await EmployeeApiService.getEmployeeById(this.employeeId);
        if (response.success) {
          this.employee = { ...this.employee, ...response.data };
          this.originalEmployee = JSON.parse(JSON.stringify(this.employee));
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        console.error('직원 정보 로드 실패:', error);
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
        certificates: [],
        projects: [],
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

      try {
        let result;
        if (this.isAddMode) {
          result = await EmployeeApiService.createEmployee(this.employee);
          if (result.success) {
            this.showMessage('직원 정보가 성공적으로 등록되었습니다.', 'success');
            this.$router.push(`/employee-detail/${result.data.id}`);
          } else {
            throw new Error(result.error);
          }
        } else {
          result = await EmployeeApiService.updateEmployee(this.employeeId, this.employee);
          if (result.success) {
            this.showMessage('직원 정보가 성공적으로 수정되었습니다.', 'success');
            this.originalEmployee = JSON.parse(JSON.stringify(this.employee));
          } else {
            throw new Error(result.error);
          }
        }

        this.editMode = false;
        this.errors = {};
      } catch (error) {
        console.error('저장 실패:', error);
        this.showMessage(error.message || '저장에 실패했습니다.', 'error');
      }
    },

    // 직원 삭제

    async deleteEmployee() {
      this.confirmMessage = '정말로 이 직원 정보를 삭제하시겠습니까?';
      this.confirmAction = this.confirmDeleteEmployee;
      this.showConfirm = true;
    },

    async confirmDeleteEmployee() {
      try {
        const result = await EmployeeApiService.deleteEmployee(this.employeeId);
        if (result.success) {
          this.showMessage('직원 정보가 삭제되었습니다.', 'success');
          this.$router.push('/employee-list');
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('삭제 실패:', error);
        this.showMessage(error.message || '삭제에 실패했습니다.', 'error');
      } finally {
        this.showConfirm = false;
      }
    },

    // 폼 유효성 검증
    validateForm() {
      this.errors = {};

      if (!this.employee.name || this.employee.name.trim() === '') {
        this.errors.name = '성명은 필수입니다.';
      }

      if (!this.employee.birth_date) {
        this.errors.birth_date = '생년월일은 필수입니다.';
      }

      if (!this.employee.department) {
        this.errors.department = '부서는 필수입니다.';
      }

      if (!this.employee.position) {
        this.errors.position = '직급은 필수입니다.';
      }

      if (!this.employee.hire_date) {
        this.errors.hire_date = '입사일은 필수입니다.';
      }

      if (this.employee.email && !this.isValidEmail(this.employee.email)) {
        this.errors.email = '유효한 이메일 형식이 아닙니다.';
      }

      return Object.keys(this.errors).length === 0;
    },

    // 필드별 유효성 검증
    validateField(field) {
      if (this.errors[field]) {
        delete this.errors[field];
      }

      switch (field) {
        case 'name':
          if (!this.employee.name || this.employee.name.trim() === '') {
            this.errors.name = '성명은 필수입니다.';
          }
          break;
        case 'email':
          if (this.employee.email && !this.isValidEmail(this.employee.email)) {
            this.errors.email = '유효한 이메일 형식이 아닙니다.';
          }
          break;
      }
    },

    // 이메일 유효성 검증
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    // 직원 정보 업데이트
    updateEmployee(updatedData) {
      this.employee = { ...this.employee, ...updatedData };
    },

    // 사진 변경
    onPhotoChange(photoData) {
      this.employee.photo = photoData;
    },

    // 경력 변경
    onCareerChange() {
      // 경력 변경 시 추가 로직이 필요하면 여기에 구현
    },

    // 학력 추가
    addEducation() {
      if (!this.employee.educations) {
        this.employee.educations = [];
      }
      this.employee.educations.push({
        admission_year: '',
        graduation_year: '',
        school_name: '',
        major: '',
        degree: '',
        gpa: '',
      });
    },

    // 학력 삭제
    removeEducation(index) {
      this.employee.educations.splice(index, 1);
    },

    // 경력 추가
    addCareer() {
      if (!this.employee.careers) {
        this.employee.careers = [];
      }
      this.employee.careers.push({
        start_date: '',
        end_date: '',
        company_name: '',
        department: '',
        position: '',
        responsibilities: '',
      });
    },

    // 경력 삭제
    removeCareer(index) {
      this.employee.careers.splice(index, 1);
    },

    // 자격증 추가
    addCertificate() {
      if (!this.employee.certificates) {
        this.employee.certificates = [];
      }
      this.employee.certificates.push({
        acquisition_date: '',
        certificate_name: '',
        issuing_authority: '',
        grade: '',
      });
    },

    // 자격증 삭제
    removeCertificate(index) {
      this.employee.certificates.splice(index, 1);
    },

    // 프로젝트 추가
    addProject() {
      if (!this.employee.projects) {
        this.employee.projects = [];
      }
      this.employee.projects.push({
        start_date: '',
        end_date: '',
        project_name: '',
        role: '',
        technologies: '',
      });
    },

    // 프로젝트 삭제
    removeProject(index) {
      this.employee.projects.splice(index, 1);
    },

    // 메시지 표시
    showMessage(text, type = 'info') {
      this.message = { text, type };
      setTimeout(() => {
        this.clearMessage();
      }, 5000);
    },

    // 메시지 클리어
    clearMessage() {
      this.message = { text: '', type: '' };
    },

    // 재시도
    retryLoad() {
      this.loadEmployee();
    },

    // 로그아웃
    logout() {
      this.confirmMessage = '로그아웃 하시겠습니까?';
      this.confirmAction = this.confirmLogout;
      this.showConfirm = true;
    },

    confirmLogout() {
      this.$store.dispatch('auth/logout');
      this.showConfirm = false;
    },
    // ToastConfirm 핸들러
    onConfirmToast() {
      if (typeof this.confirmAction === 'function') {
        this.confirmAction();
      }
    },
    onCancelToast() {
      this.showConfirm = false;
    },

    // 리포트 생성
    onGenerateReport(reportData) {
      console.log('리포트 생성:', reportData);
      // 실제로는 PDF 생성이나 리포트 API 호출
      this.showMessage(`${reportData.employee.name}의 성과 리포트가 생성되었습니다.`, 'success');
    },
  },
  mounted() {
    // 마운트 후 추가 작업이 필요하면 여기에 구현
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

.resume-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  padding: 30px;
  min-height: 600px;
}

.resume-left {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.resume-right {
  display: flex;
  flex-direction: column;
  gap: 30px;
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
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.table-container {
  animation: fadeInUp 0.6s ease-out;
}

.resume-left > *,
.resume-right > * {
  animation: fadeInUp 0.6s ease-out;
}

.resume-left > *:nth-child(1) { animation-delay: 0.1s; }
.resume-left > *:nth-child(2) { animation-delay: 0.2s; }
.resume-right > *:nth-child(1) { animation-delay: 0.3s; }
.resume-right > *:nth-child(2) { animation-delay: 0.4s; }
.resume-right > *:nth-child(3) { animation-delay: 0.5s; }

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
</style>
