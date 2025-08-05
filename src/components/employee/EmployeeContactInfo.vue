<template>
  <div class="contact-info-section">
    <div class="contact-layout">
      <div class="contact-row">
        <label for="email" class="contact-label">이메일</label>
        <input
          id="email"
          type="email"
          v-model="localEmployee.email"
          :disabled="!editMode"
          :class="{ error: errors.email }"
          @blur="validateField('email')"
          @input="updateEmployee"
          class="contact-input"
        />
        <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
      </div>

      <div class="contact-row">
        <label for="phone" class="contact-label">전화번호</label>
        <input
          id="phone"
          type="tel"
          v-model="localEmployee.phone"
          placeholder="하이픈 없이 숫자만 입력 (예: 01012345678)"
          :disabled="!editMode"
          :class="{ error: errors.phone }"
          @input="handlePhoneInput"
          @blur="validateField('phone')"
          class="contact-input"
        />
        <div v-if="errors.phone" class="error-message">{{ errors.phone }}</div>
      </div>
    </div>

    <div class="contact-layout">
      <div class="contact-row address-row">
        <label for="address" class="contact-label">주소</label>
        <input
          id="address"
          type="text"
          v-model="localEmployee.address"
          :disabled="!editMode"
          :class="{ error: errors.address }"
          @blur="validateField('address')"
          @input="updateEmployee"
          class="contact-input address-input"
        />
        <div v-if="errors.address" class="error-message">{{ errors.address }}</div>
      </div>

      <div class="contact-row address-row">
        <label for="workplace" class="contact-label">근무지</label>
        <input
          id="workplace"
          type="text"
          v-model="localEmployee.workplace"
          :disabled="!editMode"
          @input="updateEmployee"
          class="contact-input address-input"
        />
      </div>
    </div>

    <div class="contact-row skills-row">
      <label for="skills" class="contact-label">보유 기술</label>
      <textarea
        id="skills"
        v-model="localEmployee.skills"
        :disabled="!editMode"
        rows="3"
        @input="updateEmployee"
        class="skills-textarea"
      ></textarea>
    </div>
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
.contact-info-section {
  margin-top: 20px;
}

.contact-layout {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.contact-row {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.address-row {
  flex: 1;
}

.skills-row {
  margin-top: 10px;
}

.contact-label {
  font-weight: 500;
  margin-bottom: 5px;
  color: #495057;
}

.contact-input {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.contact-input:disabled {
  background-color: transparent;
  border: none;
  padding: 0;
}

.contact-input.error {
  border-color: #dc3545;
}

.address-input {
  min-width: 200px;
}

.skills-textarea {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.skills-textarea:disabled {
  background-color: transparent;
  border: none;
  padding: 0;
  resize: none;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .contact-layout {
    flex-direction: column;
    gap: 15px;
  }

  .address-input {
    min-width: auto;
  }
}
</style>
