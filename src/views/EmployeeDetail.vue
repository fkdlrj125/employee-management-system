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
      <div class="search-employee-bar" style="width:100%;">
        <div class="employee-bar-left">
          <router-link to="/employee-list" class="home-btn" title="메인으로">
            <i class="fas fa-home"></i>
          </router-link>
          <input type="text" v-model="searchName" placeholder="직원명 검색..." id="searchEmployeeName">
          <button class="btn btn-primary" @click="searchEmployee" id="searchEmployeeBtn"><i class="fas fa-search"></i> 검색</button>
          <div class="error-message" v-if="searchError" id="searchError">{{ searchError }}</div>
          <div class="employee-btn-group">
            <button class="btn btn-primary" @click="editMode = true" id="editDetailBtn"><i class="fas fa-edit"></i> 수정</button>
            <button class="btn btn-primary" v-if="editMode" @click="saveDetail" 
                    :class="{ 'save-detail-btn-hidden': !editMode }" id="saveDetailBtn"><i class="fas fa-save"></i> 저장</button>
          </div>
        </div>
        <div class="user-action-bar">
          <span id="userNameDisplay" style="font-weight:500;">{{ userName }} 님</span>
          <button class="btn btn-secondary" @click="logout" type="button" aria-label="로그아웃" id="logoutBtn">로그아웃</button>
          <button class="btn btn-primary delete-detail-btn" @click="deleteEmployee" id="deleteDetailBtn"><i class="fas fa-trash"></i> 삭제</button>
        </div>
      </div>
      <!-- 메시지 표시 -->
      <div class="message-container" v-if="message" id="messageContainer">
        <div class="message-content" :class="messageType" id="messageContent">{{ message }}</div>
      </div>
      <div class="resume-left">
        <div class="resume-section">
          <div class="education-section">
            <div class="photo-info-layout">
              <div class="resume-photo resume-photo-reset">
                <label id="detailPhotoContainer" class="detail-photo-container" for="detailPhotoInput" style="cursor:pointer;">
                  <img v-if="employee.photoUrl" :src="employee.photoUrl" alt="직원 사진" class="detail-photo" id="detailPhoto">
                  <div v-else id="photoIcon" class="photo-icon">
                    <i class="fas fa-user"></i>
                  </div>
                  <input type="file" accept="image/*" class="detail-photo-input" :disabled="!editMode" @change="onPhotoChange" style="display:none;" id="detailPhotoInput">
                </label>
              </div>
              <div class="info-table-container">
                <table class="info-table">
                  <tr>
                    <th class="required-field">성명</th>
                    <td>
                      <input type="text" v-model="employee.name" :disabled="!editMode" id="detailName">
                      <div class="error-message" id="nameError"></div>
                    </td>
                    <th class="required-field">생년월일</th>
                    <td>
                      <input type="date" v-model="employee.birth" :disabled="!editMode" class="detail-input-full-width" id="detailBirth">
                      <div class="error-message" id="birthError"></div>
                    </td>
                  </tr>
                  <tr>
                    <th class="required-field">부서</th>
                    <td>
                      <select v-model="employee.department" :disabled="!editMode" class="detail-input-full-width" id="detailDepartment">
                        <option value="">부서 선택</option>
                        <option value="DSS1">DSS1</option>
                        <option value="DSS2">DSS2</option>
                        <option value="CSC">CSC</option>
                        <option value="HR">HR</option>
                      </select>
                      <div class="error-message" id="departmentError"></div>
                    </td>
                    <th class="required-field">직급</th>
                    <td>
                      <select v-model="employee.position" :disabled="!editMode" class="detail-input-full-width" id="detailPosition">
                        <option value="">직급 선택</option>
                        <option value="사원">사원</option>
                        <option value="대리">대리</option>
                        <option value="과장">과장</option>
                        <option value="차장">차장</option>
                        <option value="부장">부장</option>
                        <option value="실장">실장</option>
                        <option value="본부장">본부장</option>
                        <option value="이사">이사</option>
                        <option value="부사장">부사장</option>
                        <option value="사장">사장</option>
                      </select>
                      <div class="error-message" id="positionError"></div>
                    </td>
                  </tr>
                  <tr>
                    <th class="required-field">입사일</th>
                    <td>
                      <input type="date" v-model="employee.join_date" :disabled="!editMode" class="detail-input-full-width" id="detailHire">
                      <div class="error-message" id="hireError"></div>
                    </td>
                    <th class="mitmas-career-header">
                      <div>MITMAS</div>
                      <div>총 경력</div>
                    </th>
                    <td>
                      <span class="career-box career-box-full-width"><span id="mitmasTotalCareer">{{ formatCareer(employee.career_years) }}</span></span>
                    </td>
                  </tr>
                  <tr>
                    <th>EUS 경력(수기 작성)</th>
                    <td>
                      <input type="text" v-model="employee.eus_career" :disabled="!editMode" class="detail-input-full-width" placeholder="년 + 개월로 입력하세요" id="detailEusCareer">
                      <div class="error-message" id="eusCareerError"></div>
                    </td>
                    <th>총 경력</th>
                    <td>
                      <input type="text" v-model="employee.total_career" :disabled="!editMode" class="detail-input-full-width" placeholder="자동 계산됨" readonly id="detailTotalCareer">
                      <div class="error-message" id="totalCareerError"></div>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
            <div class="contact-info-under-photo">
              <div class="contact-layout">
                <div class="contact-row contact-row-flex">
                  <label for="detailEmail" class="email-label">이메일</label>
                  <input type="email" v-model="employee.email" :disabled="!editMode" class="email-input" id="detailEmail">
                  <div class="error-message" id="emailError"></div>
                </div>
                <div class="contact-row contact-row-flex">
                  <label for="detailPhone" class="phone-label">전화번호</label>
                  <input type="tel" v-model="employee.phone" placeholder="하이픈 없이 숫자만 입력 (예: 01012345678)" :disabled="!editMode" class="phone-input" id="detailPhone">
                  <div class="error-message" id="phoneError"></div>
                </div>
              </div>
              <div class="contact-layout">
                <div class="contact-row contact-row-flex address-row">
                  <label for="detailAddress">주소</label>
                  <input type="text" v-model="employee.address" :disabled="!editMode" class="address-input" id="detailAddress">
                  <div class="error-message" id="addressError"></div>
                </div>
                <div class="contact-row contact-row-flex address-row">
                  <label for="detailWorkplace">근무지</label>
                  <input type="text" v-model="employee.workplace" :disabled="!editMode" class="address-input" id="detailWorkplace">
                  <div class="error-message" id="workplaceError"></div>
                </div>
              </div>
              <div class="contact-row skills-row">
                <label for="detailSkills">보유 기술</label>
                <textarea v-model="employee.skills" :disabled="!editMode" class="skills-input" rows="2" id="detailSkills"></textarea>
                <div class="error-message" id="skillsError"></div>
              </div>
            </div>
          </div>
          
          <!-- 학력 테이블 -->
          <div class="education-divider">
            <h4 class="section-title modern-title">학력</h4>
            <EducationTable 
              v-model="employee.educations" 
              :editMode="editMode" 
            />
          </div>
          
          <!-- 자격증 테이블 -->
          <div class="certificate-section">
            <h4 class="section-title modern-title">자격증</h4>
            <!-- <CertificateTable 
              v-model="employee.certificates" 
              :editMode="editMode" 
            /> -->
            <p>자격증 테이블 (임시 비활성화)</p>
          </div>
          
          <!-- 경력 테이블 -->
          <div class="resume-section-margin">
            <h4 class="section-title modern-title">경력사항(내부경력)</h4>
            <CareerTable 
              v-model="employee.careers" 
              :editMode="editMode" 
            />
          </div>
          
          <!-- 프로젝트 테이블 -->
          <div class="resume-section-margin">
            <h4 class="section-title modern-title">대외경력</h4>
            <ProjectTable 
              v-model="employee.projects" 
              :editMode="editMode" 
            />
          </div>
        </div>
      </div>
    </div>
    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p>직원 정보를 불러오는 중...</p>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import EducationTable from '@/components/employee/EducationTable.vue'
// import CertificateTable from '@/components/employee/CertificateTable.vue'
import CareerTable from '@/components/employee/CareerTable.vue'
import ProjectTable from '@/components/employee/ProjectTable.vue'

export default {
  name: 'EmployeeDetail',
  components: {
    EducationTable,
    // CertificateTable,
    CareerTable,
    ProjectTable
  },
  data() {
    return {
      editMode: false,
      searchName: '',
      searchError: '',
      message: '',
      messageType: '',
      debugInfo: ''
    }
  },
  computed: {
    ...mapGetters('auth', ['currentUser']),
    ...mapGetters('employee', ['currentEmployee', 'isLoading', 'hasError', 'errorMessage']),
    employee() {
      const emp = this.currentEmployee
      if (!emp) return null
      
      // 테이블 데이터가 없으면 빈 배열로 초기화
      return {
        ...emp,
        educations: emp.educations || [],
        certificates: emp.certificates || [],
        careers: emp.careers || [],
        projects: emp.projects || []
      }
    },
    userName() {
      return this.currentUser ? this.currentUser.username : ''
    }
  },
  created() {
    try {
      const id = this.$route.params.id
      console.log('EmployeeDetail created with id:', id)
      console.log('Current route:', this.$route)
      
      if (id) {
        this.debugInfo = `직원 ID: ${id} 로드 시도 중...`
        this.fetchEmployeeById(id).catch(error => {
          console.error('Failed to fetch employee:', error)
          this.debugInfo = `직원 로드 실패: ${error.message || error}`
        })
      } else {
        console.error('No employee ID provided')
        this.debugInfo = '직원 ID가 제공되지 않음'
      }
    } catch (error) {
      console.error('Error in created hook:', error)
      this.debugInfo = `created 훅 에러: ${error.message || error}`
    }
  },
  methods: {
    ...mapActions('auth', ['logout']),
    ...mapActions('employee', ['fetchEmployeeById', 'updateEmployee', 'deleteEmployee']),
    onPhotoChange(e) {
      const file = e.target.files[0]
      if (file) {
        // 미리보기 및 업로드용 파일 저장
        this.employee.photoFile = file
        const reader = new FileReader()
        reader.onload = evt => {
          this.employee.photoUrl = evt.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    async saveDetail() {
      if (!this.employee) return
      const result = await this.updateEmployee({ id: this.employee.id, data: this.employee })
      if (result && result.success) {
        this.message = '저장되었습니다.'
        this.messageType = 'message-success'
        this.editMode = false
      } else {
        this.message = result.error || '저장에 실패했습니다.'
        this.messageType = 'message-error'
      }
      setTimeout(() => { this.message = '' }, 2000)
    },
    async deleteEmployee() {
      if (!this.employee) return
      if (confirm('정말 삭제하시겠습니까?')) {
        const result = await this.deleteEmployee(this.employee.id)
        if (result && result.success) {
          this.$router.push('/employee-list')
        } else {
          this.message = result.error || '삭제에 실패했습니다.'
          this.messageType = 'message-error'
        }
      }
    },
    searchEmployee() {
      // 직원명 검색 기능 구현 예정
      if (!this.searchName.trim()) {
        this.searchError = '직원명을 입력하세요.'
        return
      }
      this.searchError = ''
      // 검색 결과 페이지로 이동 등 구현 가능
    },
    retryLoad() {
      const id = this.$route.params.id
      if (id) {
        this.fetchEmployeeById(id)
      }
    },
    formatCareer(careerYears) {
      if (!careerYears && careerYears !== 0) {
        return '0년 0개월'
      }
      
      // careerYears가 숫자라면 년수로 계산
      if (typeof careerYears === 'number') {
        const years = Math.floor(careerYears)
        const months = Math.floor((careerYears - years) * 12)
        return `${years}년 ${months}개월`
      }
      
      // 문자열이면 그대로 반환
      return careerYears.toString()
    }
  }
}
</script>

<style scoped>
.resume-bg {
  min-height: 100vh;
  background: linear-gradient(120deg, #e3e9f7 0%, #f5f8fd 100%);
  padding: 20px;
}
.resume-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}
.search-employee-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}
.employee-btn-group {
  display: flex;
  gap: 10px;
}
.detail-photo-container {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ddd;
  background-color: #f8f9fa;
}
.detail-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e9ecef;
  color: #6c757d;
  font-size: 48px;
}
.photo-info-layout {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}
.info-table-container {
  flex: 1;
}
.info-table {
  width: 100%;
  border-collapse: collapse;
}
.info-table th,
.info-table td {
  padding: 12px;
  border: 1px solid #ddd;
  text-align: left;
}
.info-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  width: 120px;
}
.info-table input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}
.info-table input:disabled {
  background-color: transparent;
  border: none;
  padding: 0;
}
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.btn-primary {
  background-color: #007bff;
  color: white;
}
.btn-secondary {
  background-color: #6c757d;
  color: white;
}
.btn:hover {
  opacity: 0.9;
}
.employee-bar-left {
  display: flex;
  align-items: center;
  gap: 15px;
}
.home-btn {
  background-color: #28a745;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  text-decoration: none;
}
.user-action-bar {
  display: flex;
  align-items: center;
  gap: 15px;
}
.message-container {
  margin-bottom: 20px;
}
.message-content {
  padding: 12px;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
}
.loading-container {
  text-align: center;
  padding: 50px;
}
.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.message-success {
  background-color: #42b983;
  color: white;
}
.message-error {
  background-color: #dc3545;
  color: white;
}
.error-container {
  text-align: center;
  padding: 50px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  max-width: 800px;
  margin: 50px auto;
}
.error-message {
  margin-bottom: 20px;
}
.error-message h3 {
  color: #dc3545;
  margin-bottom: 15px;
}
.error-message p {
  margin: 10px 0;
  text-align: left;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  border-left: 4px solid #dc3545;
}
</style>