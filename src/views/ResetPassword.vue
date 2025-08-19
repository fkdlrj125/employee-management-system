<template>
  <div class="reset-password-container">
    <h2>비밀번호 재설정</h2>
    <div v-if="tokenValid">
      <form @submit.prevent="submitNewPassword">
        <label for="newPassword">새 비밀번호</label>
        <input type="password" id="newPassword" v-model="newPassword" required />
        <label for="confirmPassword">비밀번호 확인</label>
        <input type="password" id="confirmPassword" v-model="confirmPassword" required />
        <button type="submit" :disabled="!canSubmit || isLoading">
          비밀번호 변경
        </button>
        <div v-if="isLoading" class="loading-spinner">처리 중...</div>
      </form>
      <p v-if="passwordMismatch" class="error">비밀번호가 일치하지 않습니다.</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </div>
    <div v-else>
      <p class="error">비밀번호 변경 링크가 만료되었거나 잘못되었습니다.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ResetPassword',
  data() {
    return {
      token: '',
      tokenValid: false,
      newPassword: '',
      confirmPassword: '',
      errorMessage: '',
      successMessage: '',
      isLoading: false,
    };
  },
  computed: {
    passwordMismatch() {
      return this.newPassword && this.confirmPassword && this.newPassword !== this.confirmPassword;
    },
    canSubmit() {
      return (
        this.newPassword &&
        this.confirmPassword &&
        this.newPassword === this.confirmPassword
      );
    },
  },
  created() {
    this.token = this.$route.query.token;
    this.verifyToken();
  },
  methods: {
    async verifyToken() {
      try {
        const res = await axios.post('/api/auth/verify-reset-token', { token: this.token });
        this.tokenValid = res.data.valid;
      } catch (err) {
        this.tokenValid = false;
      }
    },
    async submitNewPassword() {
      if (this.passwordMismatch) {
        this.errorMessage = '비밀번호가 일치하지 않습니다.';
        return;
      }
      this.isLoading = true;
      try {
        const res = await axios.post('/api/auth/reset-password', {
          token: this.token,
          newPassword: this.newPassword,
        });
        if (res.data.success) {
          this.successMessage = '비밀번호가 성공적으로 변경되었습니다.';
          this.errorMessage = '';
        } else {
          this.errorMessage = res.data.message || '비밀번호 변경에 실패했습니다.';
        }
      } catch (err) {
        this.errorMessage = '비밀번호 변경 중 오류가 발생했습니다.';
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.reset-password-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 32px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
label {
  display: block;
  margin-bottom: 8px;
}
input {
  width: 100%;
  padding: 8px;
  margin-bottom: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  width: 100%;
  padding: 10px;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
}
.error {
  color: #dc3545;
  margin-top: 12px;
}
.success {
  color: #28a745;
  margin-top: 12px;
}
.loading-spinner {
  margin-top: 12px;
  color: #007bff;
  font-size: 15px;
  text-align: center;
}
</style>
