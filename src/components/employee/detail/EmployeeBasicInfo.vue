<template>
  <div class="photo-info-layout">
    <!-- 사진 영역 -->
    <div class="resume-photo">
      <div class="frame-photo-container">
        <label class="detail-photo-container" :class="{ disabled: !editMode }">
          <img
            v-if="employee.photoUrl"
            :src="employee.photoUrl"
            alt="직원 사진"
            class="detail-photo"
          />
          <div v-else class="photo-icon">
            <i class="fas fa-user"></i>
          </div>
          <input
            type="file"
            accept="image/*"
            class="detail-photo-input d-none"
            :disabled="!editMode"
            @change="onPhotoChange"
          />
        </label>
      </div>
    </div>

    <!-- 기본 정보 테이블 -->
    <div class="info-table-container">
      <table class="info-table">
        <tbody>
          <tr>
            <th class="info-label required-field">성명 <span class="required-badge">필수</span></th>
            <td>
              <input
                type="text"
                v-model="localEmployee.name"
                :disabled="!editMode"
                :class="['info-input', 'plain-input', { error: errors.name } ]"
                @blur="validateField('name', localEmployee.name)"
                @input="updateEmployee(); validateField('name', localEmployee.name)"
              />
              <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
            </td>
            <th class="info-label required-field">생년월일 <span class="required-badge">필수</span></th>
            <td>
              <input
                type="date"
                v-model="localEmployee.birth_date"
                :disabled="!editMode"
                :class="['info-input', 'plain-input', { error: errors.birth_date } ]"
                @change="validateField('birth_date', localEmployee.birth_date)"
                @input="updateEmployee(); validateField('birth_date', localEmployee.birth_date)"
              />
              <div v-if="errors.birth_date" class="error-message">{{ errors.birth_date }}</div>
            </td>
          </tr>
          <tr>
            <th class="info-label required-field">부서 <span class="required-badge">필수</span></th>
            <td>
              <select
                v-model="localEmployee.department"
                :disabled="!editMode"
                :class="['info-input', 'plain-input', { error: errors.department } ]"
                @change="validateField('department', localEmployee.department); updateEmployee();"
              >
                <option value="">부서 선택</option>
                <option value="DSS1">DSS1</option>
                <option value="DSS2">DSS2</option>
                <option value="CSC">CSC</option>
                <option value="HR">HR</option>
                <option v-if="localEmployee.department && !['DSS1','DSS2','CSC','HR'].includes(localEmployee.department)" :value="localEmployee.department">{{ localEmployee.department }}</option>
              </select>
              <div v-if="errors.department" class="error-message">{{ errors.department }}</div>
            </td>
            <th class="info-label required-field">직급 <span class="required-badge">필수</span></th>
            <td>
              <select
                v-model="localEmployee.position"
                :disabled="!editMode"
                :class="['info-input', 'plain-input', { error: errors.position } ]"
                @change="validateField('position', localEmployee.position); updateEmployee();"
              >
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
                <option v-if="localEmployee.position && !['사원','대리','과장','차장','부장','실장','본부장','이사','부사장','사장'].includes(localEmployee.position)" :value="localEmployee.position">{{ localEmployee.position }}</option>
              </select>
              <div v-if="errors.position" class="error-message">{{ errors.position }}</div>
            </td>
          </tr>
          <tr>
            <th class="info-label required-field">입사일 <span class="required-badge">필수</span></th>
            <td>
              <input
                type="month"
                v-model="localEmployee.hire_date"
                :disabled="!editMode"
                :class="['info-input', 'plain-input', { error: errors.hire_date } ]"
                @change="handleHireDateChange(); validateField('hire_date', localEmployee.hire_date)"
              />
              <div v-if="errors.hire_date" class="error-message">{{ errors.hire_date }}</div>
            </td>
            <th class="info-label mitmas-career-header">
              <div><b>MITMAS</b></div>
              <div><b>총 경력</b></div>
            </th>
            <td>
              <span class="career-box">{{ formatCareer(mitmasCareer) }}</span>
            </td>
          </tr>
          <tr>
            <th class="info-label">EUS 경력(수기)</th>
            <td>
              <input
                type="text"
                v-model="localEmployee.eus_career"
                :disabled="!editMode"
                placeholder="년 + 개월로 입력하세요"
                @input="handleEusCareerChange"
                class="info-input plain-input"
              />
            </td>
            <th class="info-label">총 경력</th>
            <td>
              <input type="text" :value="totalCareer" disabled placeholder="자동 계산됨" readonly class="info-input plain-input cursor-default" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmployeeBasicInfo',
  props: {
    employee: {
      type: Object,
      required: true,
    },
    editMode: {
      type: Boolean,
      default: false,
    },
    errors: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:employee', 'photo-change', 'validate-field'],
  data() {
    return {
      localEmployee: { ...this.employee },
      mitmasCareer: 0,
      totalCareer: '0년 0개월',
    };
  },
  watch: {
    employee: {
      handler(newVal) {
        // hire_date가 YYYY-MM-DD면 YYYY-MM으로 변환
        const copy = { ...newVal };
        if (copy.hire_date && /^\d{4}-\d{2}-\d{2}$/.test(copy.hire_date)) {
          copy.hire_date = copy.hire_date.slice(0, 7);
        }
        this.localEmployee = copy;
        this.calculateMitmasCareer();
        this.calculateTotalCareer();
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    this.calculateMitmasCareer();
    this.calculateTotalCareer();
  },
  methods: {
    // 경력테이블 경력 개월수 합산 함수
    calculateCareerTableMonths() {
      if (!Array.isArray(this.employee.careers)) return 0;
      let total = 0;
      this.employee.careers.forEach(career => {
        const start = career.period_start;
        let end = career.period_end;
        if (start) {
          const startDate = new Date(start);
          // end가 없으면 현재 날짜로 처리(재직 중)
          const endDate = end ? new Date(end) : new Date();
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            let months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
            if (endDate.getDate() < startDate.getDate()) months--;
            total += Math.max(0, months + 1); // +1: 시작월 포함
          }
        }
      });
      return total;
    },
    onPhotoChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.localEmployee.photoUrl = e.target.result;
          this.updateEmployee();
        };
        reader.readAsDataURL(file);
        this.$emit('photo-change', file);
      }
    },

    updateEmployee() {
      this.$emit('update:employee', { ...this.localEmployee });
    },

    validateField(fieldName) {
      this.$emit('validate-field', fieldName, this.localEmployee[fieldName]);
    },

    handleHireDateChange() {
      this.validateField('hire_date');
      this.calculateMitmasCareer();
      this.calculateTotalCareer();
      this.updateEmployee();
    },

    handleEusCareerChange() {
      this.calculateTotalCareer();
      this.updateEmployee();
    },

    calculateMitmasCareer() {
      if (!this.localEmployee.hire_date) {
        this.mitmasCareer = 0;
        return;
      }

      const hireDate = new Date(this.localEmployee.hire_date);
      const today = new Date();

      if (isNaN(hireDate.getTime())) {
        this.mitmasCareer = 0;
        return;
      }

      let months =
        (today.getFullYear() - hireDate.getFullYear()) * 12 +
        (today.getMonth() - hireDate.getMonth());
      if (today.getDate() < hireDate.getDate()) months--;
      this.mitmasCareer = Math.max(0, months);
    },

    calculateTotalCareer() {
      // MITMAS 경력
      const mitmasMonths = this.mitmasCareer;

      // 경력테이블 경력 개월수만 합산 (EUS 경력 제외)
      const tableMonths = this.calculateCareerTableMonths();

      const totalMonths = mitmasMonths + tableMonths;
      this.totalCareer = this.formatCareer(totalMonths);
      // 무한 루프 방지를 위해 career-change emit 제거
    },

    formatCareer(months) {
      if (!months || months === 0) return '0년 0개월';

      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;

      let result = '';
      if (years > 0) result += `${years}년`;
      if (remainingMonths > 0) {
        if (result) result += ' ';
        result += `${remainingMonths}개월`;
      }

      return result || '0년 0개월';
    },
  },
};
</script>

<style scoped>

.required-badge {
  color: #e74c3c;
  font-size: 12px;
  font-weight: bold;
  margin-left: 4px;
  vertical-align: middle;
}
.error-message {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 2px;
}

/* 사진 관련 스타일만 남김 */
.photo-info-layout {
  display: flex;
  gap: 36px;
  align-items: center;
  margin-bottom: 20px;
}
.resume-photo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 160px;
}
.frame-photo-container {
  padding: 10px;
  border: 2.5px solid #adb5bd;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
}
.detail-photo-container {
  width: 120px;
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  cursor: pointer;
  transition: box-shadow 0.2s;
  border: none;
  box-shadow: none;
}
.detail-photo-container.disabled {
  cursor: default;
}
.detail-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}
.photo-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e9ecef;
  color: #6c757d;
  font-size: 56px;
  border-radius: 12px;
}
</style>
