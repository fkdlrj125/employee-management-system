<template>
  <div class="reset-password-container">
    <h2>비밀번호 재설정</h2>
    <div v-if="tokenValid">
      <form @submit.prevent="submitReset">
        <label for="department">부서 선택</label>
        <select id="department" v-model="selectedDept" required>
          <option value="" disabled>부서를 선택하세요</option>
          <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
        </select>
        <label for="newPassword">새 비밀번호</label>
        <input type="password" id="newPassword" v-model="newPassword" required placeholder="새 비밀번호" />
        <label for="confirmPassword">비밀번호 확인</label>
        <input type="password" id="confirmPassword" v-model="confirmPassword" required placeholder="비밀번호 확인" />
        <button type="submit" :disabled="!canSubmit || isLoading">비밀번호 재설정</button>
        <div v-if="isLoading" class="loading-spinner">처리 중...</div>
        <p v-if="passwordMismatch" class="error">비밀번호가 일치하지 않습니다.</p>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success">{{ successMessage }}</p>
      </form>
    </div>
    <div v-else>
      <p class="error">접근 권한이 없습니다.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ResetPassword',
  data() {
    return {
      departments: [],
      selectedDept: '',
      newPassword: '',
      confirmPassword: '',
      errorMessage: '',
      successMessage: '',
      isLoading: false,
      tokenValid: false,
    };
  },
  computed: {
    passwordMismatch() {
      return this.newPassword && this.confirmPassword && this.newPassword !== this.confirmPassword;
    },
    canSubmit() {
      return (
        this.selectedDept &&
        this.newPassword &&
        this.confirmPassword &&
        this.newPassword === this.confirmPassword
      );
    },
  },
  async mounted() {
    // 토큰(role) 확인
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        this.tokenValid = false;
        return;
      }
      const res = await axios.get('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = res.data.user;
      this.tokenValid = user && user.role && user.role.toLowerCase() === 'hr';
    } catch (e) {
      this.tokenValid = false;
    }

    // 부서 목록 불러오기
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('/api/employees/meta/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.departments = res.data.departments || [];
    } catch (e) {
      this.departments = [];
    }
  },
  methods: {
    async submitReset() {
      if (this.passwordMismatch) {
        this.errorMessage = '비밀번호가 일치하지 않습니다.';
        return;
      }
      this.isLoading = true;
      try {
        const token = sessionStorage.getItem('token');
        const res = await axios.post('/api/auth/reset-password', {
          token, // HR 인증용 토큰
          department: this.selectedDept, // 선택한 부서
          newPassword: this.newPassword, // 새 비밀번호
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          this.successMessage = '비밀번호가 성공적으로 재설정되었습니다.';
          this.errorMessage = '';
          // 1초 후 목록페이지로 이동 (예: /employee-list)
          setTimeout(() => {
            this.$router.push('/employee-list'); // 라우터 경로에 맞게 수정
          }, 1000);
        } else {
          this.errorMessage = res.data.message || '비밀번호 재설정에 실패했습니다.';
        }
      } catch (err) {
        this.errorMessage = '비밀번호 재설정에 실패했습니다.';
      } finally {
        this.isLoading = false;
      }
    }
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
input, select {
  width: 100%;
  padding: 8px;
  margin-bottom: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 15px;
  background: #f9f9f9;
  box-sizing: border-box;
  transition: border-color 0.2s;
}
select:focus, input:focus {
  border-color: #007bff;
  outline: none;
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
