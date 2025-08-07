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
            class="detail-photo-input"
            :disabled="!editMode"
            @change="onPhotoChange"
            style="display: none"
          />
        </label>
      </div>
    </div>

    <!-- 기본 정보 테이블 -->
    <div class="info-table-container">
      <table class="info-table">
        <tbody>
          <tr>
            <th class="info-label required-field">성명</th>
            <td>
              <input
                type="text"
                v-model="localEmployee.name"
                :disabled="!editMode"
                :class="['info-input', 'plain-input', { error: errors.name } ]"
                @blur="validateField('name')"
                @input="updateEmployee"
              />
              <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
            </td>
            <th class="info-label required-field">생년월일</th>
            <td>
              <input
                type="date"
                v-model="localEmployee.birth_date"
                :disabled="!editMode"
                :class="['info-input', 'plain-input', { error: errors.birth_date } ]"
                @change="validateField('birth_date')"
                @input="updateEmployee"
              />
              <div v-if="errors.birth_date" class="error-message">{{ errors.birth_date }}</div>
            </td>
          </tr>
          <tr>
            <th class="info-label required-field">부서</th>
            <td>
              <select
                v-model="localEmployee.department"
                :disabled="!editMode"
                :class="['info-input', 'plain-input', { error: errors.department } ]"
                @change="validateField('department'); updateEmployee();"
              >
                <option value="">부서 선택</option>
                <option value="DSS1">DSS1</option>
                <option value="DSS2">DSS2</option>
                <option value="CSC">CSC</option>
                <option value="HR">HR</option>
              </select>
              <div v-if="errors.department" class="error-message">{{ errors.department }}</div>
            </td>
            <th class="info-label required-field">직급</th>
            <td>
              <select
                v-model="localEmployee.position"
                :disabled="!editMode"
                :class="['info-input', 'plain-input', { error: errors.position } ]"
                @change="validateField('position'); updateEmployee();"
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
              </select>
              <div v-if="errors.position" class="error-message">{{ errors.position }}</div>
            </td>
          </tr>
          <tr>
            <th class="info-label required-field">입사일</th>
            <td>
              <input
                type="month"
                v-model="localEmployee.hire_date"
                :disabled="!editMode"
                :class="['info-input', 'plain-input', { error: errors.hire_date } ]"
                @change="handleHireDateChange"
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
            <th class="info-label">EUS 경력(수기 작성)</th>
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
              <input type="text" :value="totalCareer" disabled placeholder="자동 계산됨" readonly class="info-input plain-input" style="cursor: default;" />
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
  emits: ['update:employee', 'photo-change', 'validate-field', 'career-change'],
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
        this.localEmployee = { ...newVal };
        this.calculateMitmasCareer();
        this.calculateTotalCareer();
      },
      deep: true,
    },
  },
  mounted() {
    this.calculateMitmasCareer();
    this.calculateTotalCareer();
  },
  methods: {
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

      // EUS 경력 파싱
      let eusMonths = 0;
      if (this.localEmployee.eus_career) {
        const eusText = this.localEmployee.eus_career.trim();
        const yearMatch = eusText.match(/(\d+)년/);
        const monthMatch = eusText.match(/(\d+)개월/);

        if (yearMatch) eusMonths += parseInt(yearMatch[1]) * 12;
        if (monthMatch) eusMonths += parseInt(monthMatch[1]);
      }

      const totalMonths = mitmasMonths + eusMonths;
      this.totalCareer = this.formatCareer(totalMonths);

      this.$emit('career-change', totalMonths);
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

@import '@/assets/css/common/plain-input.css';
@import '@/assets/css/common/tables.css';

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
