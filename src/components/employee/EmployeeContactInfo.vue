<template>
  <div class="contact-info-section">
    <table class="info-table">
      <tbody>
        <tr>
          <th class="info-label">이메일</th>
          <td>
            <input
              id="email"
              type="email"
              v-model="localEmployee.email"
              :disabled="!editMode"
              :class="['info-input', 'plain-input', { error: errors.email } ]"
              @blur="validateField('email')"
              @input="updateEmployee"
            />
            <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
          </td>
          <th class="info-label">전화번호</th>
          <td>
            <input
              id="phone"
              type="tel"
              v-model="localEmployee.phone"
              placeholder="하이픈 없이 숫자만 입력 (예: 01012345678)"
              :disabled="!editMode"
              :class="['info-input', 'plain-input', { error: errors.phone } ]"
              @input="handlePhoneInput"
              @blur="validateField('phone')"
            />
            <div v-if="errors.phone" class="error-message">{{ errors.phone }}</div>
          </td>
        </tr>
        <tr>
          <th class="info-label">주소</th>
          <td>
            <input
              id="address"
              type="text"
              v-model="localEmployee.address"
              :disabled="!editMode"
              :class="['info-input', 'plain-input', { error: errors.address } ]"
              @blur="validateField('address')"
              @input="updateEmployee"
            />
            <div v-if="errors.address" class="error-message">{{ errors.address }}</div>
          </td>
          <th class="info-label">근무지</th>
          <td>
            <input
              id="workplace"
              type="text"
              v-model="localEmployee.workplace"
              :disabled="!editMode"
              @input="updateEmployee"
              class="info-input plain-input"
            />
          </td>
        </tr>
        <tr>
          <th class="info-label">보유 기술</th>
          <td colspan="3" class="td-narrow">
            <textarea
              id="skills"
              v-model="localEmployee.skills"
              :disabled="!editMode"
              rows="3"
              @input="updateEmployee"
              class="info-textarea plain-input skills-textarea"
            ></textarea>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'EmployeeContactInfo',
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
  emits: ['update:employee', 'validate-field'],
  data() {
    return {
      localEmployee: { ...this.employee },
    };
  },
  watch: {
    employee: {
      handler(newVal) {
        this.localEmployee = { ...newVal };
      },
      deep: true,
    },
  },
  methods: {
    updateEmployee() {
      this.$emit('update:employee', { ...this.localEmployee });
    },

    validateField(fieldName) {
      this.$emit('validate-field', fieldName, this.localEmployee[fieldName]);
    },

    handlePhoneInput(event) {
      // 숫자만 허용
      let value = event.target.value.replace(/[^\d]/g, '');

      // 최대 11자리로 제한
      if (value.length > 11) {
        value = value.slice(0, 11);
      }

      this.localEmployee.phone = value;
      this.updateEmployee();
    },

    isValidEmail(email) {
      if (!email) return true; // 선택 필드이므로 빈 값 허용
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    isValidPhone(phone) {
      if (!phone) return true; // 선택 필드이므로 빈 값 허용

      const cleanedPhone = phone.replace(/[^\d]/g, '');

      // 10자리 또는 11자리 숫자만 허용
      if (cleanedPhone.length < 10 || cleanedPhone.length > 11) return false;

      // 010, 011, 016, 017, 018, 019로 시작하는지 확인
      const validPrefixes = ['010', '011', '016', '017', '018', '019'];
      const prefix = cleanedPhone.substring(0, 3);

      return validPrefixes.includes(prefix);
    },
  },
};
</script>

<style scoped>


@import '../../assets/css/common/plain-input.css';
@import '../../assets/css/common/tables.css';
</style>
