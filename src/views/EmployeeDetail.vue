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
      <!-- 상단 바 -->
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
          <!-- 사진 및 기본 정보 -->
          <EmployeeBasicInfo
            :employee="employee"
            :edit-mode="editMode"
            :errors="errors"
            @update:employee="updateEmployee"
            @photo-change="onPhotoChange"
            @validate-field="validateField"
            @career-change="onCareerChange"
          />

          <!-- 연락처 정보 -->
          <EmployeeContactInfo
            :employee="employee"
            :edit-mode="editMode"
            :errors="errors"
            @update:employee="updateEmployee"
            @validate-field="validateField"
          />

          <!-- 학력 테이블 -->
          <EducationTable
            :employee="employee"
            :edit-mode="editMode"
            @update:employee="updateEmployee"
          />

          <!-- 자격증 테이블 -->
          <CertificateTable
            :employee="employee"
            :edit-mode="editMode"
            @update:employee="updateEmployee"
          />

          <!-- 경력사항 테이블 -->
          <CareerTable
            :employee="employee"
            :edit-mode="editMode"
            @update:employee="updateEmployee"
          />

          <!-- 프로젝트 테이블 -->
          <ProjectTable
            :employee="employee"
            :edit-mode="editMode"
            @update:employee="updateEmployee"
          />
        </div>

        <!-- 우측 영역 - 차트 및 기술 점수 -->
        <div class="resume-right">
          <!-- 기술 역량 차트 -->
          <EmployeeSkillChart
            :employee="employee"
            :edit-mode="editMode"
            @update:employee="updateEmployee"
          />

          <!-- 기간별 성과 분석 -->
          <EmployeePeriodSelector :employee="employee" @generate-report="onGenerateReport" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EmployeeDetailHeader from '@/components/employee/EmployeeDetailHeader.vue';
import EmployeeBasicInfo from '@/components/employee/EmployeeBasicInfo.vue';
import EmployeeContactInfo from '@/components/employee/EmployeeContactInfo.vue';
import EmployeeSkillChart from '@/components/employee/EmployeeSkillChart.vue';
import EmployeePeriodSelector from '@/components/employee/EmployeePeriodSelector.vue';
import EducationTable from '@/components/employee/EducationTable.vue';
import CareerTable from '@/components/employee/CareerTable.vue';
import CertificateTable from '@/components/employee/CertificateTable.vue';
import ProjectTable from '@/components/employee/ProjectTable.vue';
import EmployeeApiService from '@/services/EmployeeApiService';

export default {
  name: 'EmployeeDetail',
  components: {
    EmployeeDetailHeader,
    EmployeeBasicInfo,
    EmployeeContactInfo,
    EmployeeSkillChart,
    EmployeePeriodSelector,
    EducationTable,
    CareerTable,
    CertificateTable,
    ProjectTable,
  },
  data() {
    return {
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
      if (!confirm('정말로 이 직원 정보를 삭제하시겠습니까?')) return;

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
      localStorage.removeItem('currentUser');
      this.$router.push('/login');
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
/* ===== 기본 레이아웃 ===== */
.resume-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

.resume-container {
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
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
  background: linear-gradient(90deg, #007bff, #6f42c1, #e83e8c);
}

/* ===== 로딩 및 에러 상태 ===== */
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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

/* ===== 메시지 컨테이너 ===== */
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

/* ===== 메인 콘텐츠 영역 ===== */
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

/* ===== 섹션 타이틀 ===== */
.section-title {
  color: #2c3e50;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #007bff, #6f42c1);
  border-radius: 2px;
}

.modern-title {
  font-size: 18px;
  color: #495057;
}

/* ===== 테이블 스타일 ===== */
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  margin-bottom: 25px;
}

.employee-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.employee-table th {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  color: #495057;
  font-weight: 600;
  padding: 15px 12px;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.employee-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f3f4;
  vertical-align: top;
}

.employee-table tr:hover {
  background-color: #f8f9fa;
}

.employee-table tr:last-child td {
  border-bottom: none;
}

.employee-table input,
.employee-table select {
  width: 100%;
  border: 1px solid #ced4da;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
}

.employee-table input:disabled,
.employee-table select:disabled {
  background: transparent;
  border: 1px solid transparent;
  color: #495057;
}

.employee-table input:focus,
.employee-table select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  background: white;
}

/* ===== 버튼 스타일 ===== */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #6c757d, #545b62);
  color: white;
  box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(108, 117, 125, 0.4);
}

.btn-remove {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  padding: 6px 12px;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.btn-remove:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

/* ===== 행 추가 컨테이너 ===== */
.add-row-container {
  padding: 15px;
  text-align: center;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

/* ===== 에러 메시지 ===== */
.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
  font-weight: 500;
}

/* ===== 반응형 디자인 ===== */
@media (max-width: 1200px) {
  .resume-content {
    grid-template-columns: 1fr;
    gap: 25px;
  }

  .resume-left {
    order: 1;
  }

  .resume-right {
    order: 2;
  }
}

@media (max-width: 768px) {
  .resume-bg {
    padding: 10px;
  }

  .resume-container {
    border-radius: 12px;
  }

  .resume-content {
    padding: 20px;
    gap: 20px;
  }

  .section-title {
    font-size: 18px;
  }

  .employee-table {
    font-size: 13px;
  }

  .employee-table th,
  .employee-table td {
    padding: 10px 8px;
  }

  .btn {
    padding: 8px 16px;
    font-size: 13px;
  }
}

@media (max-width: 576px) {
  .resume-content {
    padding: 15px;
  }

  .employee-table th,
  .employee-table td {
    padding: 8px 6px;
  }

  .section-title {
    font-size: 16px;
  }

  .btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}

/* ===== 애니메이션 ===== */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.table-container {
  animation: fadeInUp 0.6s ease-out;
}

.resume-left > *,
.resume-right > * {
  animation: fadeInUp 0.6s ease-out;
}

.resume-left > *:nth-child(1) {
  animation-delay: 0.1s;
}
.resume-left > *:nth-child(2) {
  animation-delay: 0.2s;
}
.resume-right > *:nth-child(1) {
  animation-delay: 0.3s;
}
.resume-right > *:nth-child(2) {
  animation-delay: 0.4s;
}
.resume-right > *:nth-child(3) {
  animation-delay: 0.5s;
}

/* ===== 스크롤바 스타일링 ===== */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #007bff, #6f42c1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #0056b3, #5a2d91);
}

/* ===== 포커스 개선 ===== */
.btn:focus,
input:focus,
select:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* ===== 인쇄 스타일 ===== */
@media print {
  .resume-bg {
    background: white !important;
    padding: 0;
  }

  .resume-container {
    box-shadow: none;
    border-radius: 0;
  }

  .btn {
    display: none;
  }

  .add-row-container {
    display: none;
  }
}
</style>
