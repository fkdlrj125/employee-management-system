<template>
  <div class="main-bg">
    <div class="login-container">
      <div class="login-header">
        <h1>로그인</h1>
        <p>직원 관리 시스템에 접속하세요</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">아이디</label>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="아이디를 입력하세요"
            required
            :disabled="loading || isLoginBlocked"
          />
          <div class="error-message" :class="{ show: usernameError }">{{ usernameError }}</div>
        </div>

        <div class="form-group">
          <label for="password">비밀번호</label>
          <div class="password-input-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              placeholder="비밀번호를 입력하세요"
              required
              :disabled="loading || isLoginBlocked"
            />
            <button
              type="button"
              class="password-toggle"
              @click="togglePasswordVisibility"
              :disabled="loading || isLoginBlocked"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <div class="error-message" :class="{ show: passwordError }">{{ passwordError }}</div>
        </div>

        <!-- 아이디 기억하기 체크박스 -->
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="rememberMe" :disabled="loading || isLoginBlocked" />
            <span class="checkmark"></span>
            아이디 기억하기
          </label>
        </div>

        <button
          type="submit"
          class="btn btn-primary login-btn"
          :disabled="loading || isLoginBlocked"
        >
          <span v-if="loading"> <i class="fas fa-spinner fa-spin"></i> 로그인 중... </span>
          <span v-else-if="isLoginBlocked">
            <i class="fas fa-lock"></i> 차단됨 ({{ blockTimeDisplay }})
          </span>
          <span v-else>로그인</span>
        </button>
        
        <!-- 로그인 시도 횟수 경고 -->
        <div v-if="loginAttempts > 0 && !isLoginBlocked" class="warning-message">
          <i class="fas fa-exclamation-triangle"></i>
          로그인 실패 {{ loginAttempts }}/{{ maxAttempts }}회. {{ maxAttempts - loginAttempts }}회
          더 실패하면 {{ blockTime / (60 * 1000) }}분간 차단됩니다.
        </div>

        <!-- 차단 상태 메시지 -->
        <div v-if="isLoginBlocked" class="block-message">
          <i class="fas fa-shield-alt"></i>
          보안을 위해 로그인이 일시 차단되었습니다.<br />
          <strong>{{ blockTimeDisplay }}</strong> 후에 다시 시도해주세요.
        </div>

        <div v-if="error" class="error-message show" style="margin-top: 15px">
          {{ error }}
        </div>

      </form>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { employeeApiService } from '@/services/EmployeeApiService';

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      usernameError: '',
      passwordError: '',
      loading: false,
      rememberMe: false,
      loginAttempts: 0,
      maxAttempts: 5,
      isBlocked: false,
      blockTime: 5 * 60 * 1000, // 5분
      blockEndTime: null,
      showPassword: false,
      // 모달 관련 상태
      showDeptModal: false,
      sending: false,
      isLoading: false, // 추가된 데이터
      modalMessage: '',
      modalUsername: '',
      extractedDept: '',
    };
  },
  computed: {
    ...mapGetters('auth', ['authError']),
    error() {
      return this.authError;
    },
    isLoginBlocked() {
      if (!this.isBlocked) return false;
      if (this.blockEndTime && Date.now() > this.blockEndTime) {
        this.clearBlock();
        return false;
      }
      return true;
    },
    remainingBlockTime() {
      if (!this.blockEndTime) return 0;
      const remaining = Math.ceil((this.blockEndTime - Date.now()) / 1000);
      return Math.max(0, remaining);
    },
    blockTimeDisplay() {
      const minutes = Math.floor(this.remainingBlockTime / 60);
      const seconds = this.remainingBlockTime % 60;
      return `${minutes}분 ${seconds}초`;
    },
    isAdminAccount() {
      return this.modalUsername && this.modalUsername.trim().toLowerCase() === 'admin';
    },
  },
  methods: {
    ...mapActions('auth', ['login']),
    openDeptModal() {
      this.showDeptModal = true;
      this.modalMessage = '';
      this.modalUsername = this.username;
      this.extractedDept = this.extractDeptFromUsername(this.modalUsername);
    },
    updateExtractedDept() {
      const usernameNormalized = this.modalUsername ? this.modalUsername.trim().toUpperCase() : '';
      this.extractedDept = this.extractDeptFromUsername(usernameNormalized);
    },
    closeDeptModal() {
      this.showDeptModal = false;
      this.modalMessage = '';
      this.modalUsername = '';
      this.extractedDept = '';
    },
    extractDeptFromUsername(username) {
      // 예시: 아이디가 'DSS1_홍길동' 또는 '홍길동-DSS1' 등일 때 부서 추출
      if (!username) return '';
      // DSS1, DSS2, CSC, HR, IT 등 부서 코드가 포함된 경우 추출
      const deptList = ['DSS1', 'DSS2', 'CSC', 'HR'];
      for (const dept of deptList) {
        if (username.includes(dept)) return dept;
      }
      return '';
    },
    async handleLogin() {
      // 로그인 차단 상태 확인
      if (this.isLoginBlocked) {
        return;
      }

      // 입력값 검증
      this.validateForm();

      if (!this.usernameError && !this.passwordError) {
        this.loading = true;

        try {
          const result = await this.login({
            username: this.username,
            password: this.password,
          });

          this.loading = false;

          if (result.success) {
            // 로그인 성공 시 시도 횟수 초기화
            this.resetLoginAttempts();

            // 아이디 기억하기 처리
            if (this.rememberMe) {
              localStorage.setItem('remembered_username', this.username);
            } else {
              localStorage.removeItem('remembered_username');
            }

            // 직원 목록 페이지로 이동
            this.$router.push('/employee-list');
          } else {
            // 로그인 실패 시 시도 횟수 증가
            this.handleLoginFailure();
          }
        } catch (error) {
          this.loading = false;
          this.handleLoginFailure();
        }
      }
    },
    handleLoginFailure() {
      this.loginAttempts++;

      if (this.loginAttempts >= this.maxAttempts) {
        this.blockLogin();
      }

      // localStorage에 시도 횟수 저장
      localStorage.setItem('login_attempts', this.loginAttempts.toString());
      localStorage.setItem('last_attempt_time', Date.now().toString());
    },
    blockLogin() {
      this.isBlocked = true;
      this.blockEndTime = Date.now() + this.blockTime;
      localStorage.setItem('login_blocked_until', this.blockEndTime.toString());

      // 블록 시간 동안 카운트다운 시작
      this.startBlockTimer();
    },
    startBlockTimer() {
      const timer = setInterval(() => {
        if (this.remainingBlockTime <= 0) {
          clearInterval(timer);
          this.clearBlock();
        }
      }, 1000);
    },
    clearBlock() {
      this.isBlocked = false;
      this.blockEndTime = null;
      this.resetLoginAttempts();
      localStorage.removeItem('login_blocked_until');
    },
    resetLoginAttempts() {
      this.loginAttempts = 0;
      localStorage.removeItem('login_attempts');
      localStorage.removeItem('last_attempt_time');
    },
    loadSavedData() {
      // 저장된 아이디 불러오기
      const rememberedUsername = localStorage.getItem('remembered_username');
      if (rememberedUsername) {
        this.username = rememberedUsername;
        this.rememberMe = true;
      }

      // 로그인 시도 횟수 및 차단 상태 복원
      const savedAttempts = localStorage.getItem('login_attempts');
      const lastAttemptTime = localStorage.getItem('last_attempt_time');
      const blockedUntil = localStorage.getItem('login_blocked_until');

      if (savedAttempts) {
        this.loginAttempts = parseInt(savedAttempts);
      }

      if (blockedUntil) {
        const blockEndTime = parseInt(blockedUntil);
        if (Date.now() < blockEndTime) {
          this.isBlocked = true;
          this.blockEndTime = blockEndTime;
          this.startBlockTimer();
        } else {
          // 차단 시간이 지났으면 초기화
          this.clearBlock();
        }
      }

      // 24시간이 지난 시도 기록은 초기화
      if (lastAttemptTime) {
        const hoursPassed = (Date.now() - parseInt(lastAttemptTime)) / (1000 * 60 * 60);
        if (hoursPassed >= 24) {
          this.resetLoginAttempts();
        }
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    validateForm() {
      // 유효성 검사 로직
      this.usernameError = !this.username.trim() ? '아이디를 입력해주세요.' : '';
      this.passwordError = !this.password ? '비밀번호를 입력해주세요.' : '';
    },
  },

  mounted() {
    // 컴포넌트 마운트 시 저장된 데이터 로드
    this.loadSavedData();
  },
};
</script>

<style scoped>
.extracted-dept {
  display: block;
  margin-top: 8px;
}
.admin-warning {
  color: #dc3545;
  margin-top: 8px;
  font-size: 14px;
}
.modal-username-input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 6px;
  box-sizing: border-box;
}
.modal-username-input:focus {
  outline: none;
  border-color: #007bff;
}
/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(44, 62, 80, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-box {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(44, 62, 80, 0.18);
  padding: 32px 28px 24px 28px;
  min-width: 320px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.modal-box h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #2c3e50;
}
.modal-box p {
  font-size: 15px;
  color: #495057;
  margin-bottom: 18px;
}
.modal-info {
  margin-bottom: 18px;
  font-size: 15px;
  color: #495057;
  text-align: center;
}
.modal-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
}
.modal-message {
  font-size: 14px;
  text-align: center;
}
/* 통일된 레이아웃 및 스타일 적용 (직원목록 등과 일관) */
.main-bg {
  min-height: 100vh;
  background: linear-gradient(120deg, #f8f9fa 60%, #e3e6f3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  background: white;
  padding: 36px 28px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.12);
  width: 100%;
  max-width: 420px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-header {
  text-align: center;
  margin-bottom: 22px;
}
.login-header h1 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
}
.login-header p {
  color: #7f8c8d;
  margin: 0;
  font-size: 15px;
}

.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #495057;
  font-weight: 500;
}
.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
  background: #fff;
}
.form-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.15);
}
.form-group input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.password-input-wrapper {
  position: relative;
}
.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s ease;
}
.password-toggle:hover:not(:disabled) {
  color: #007bff;
}
.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.checkbox-group {
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  margin-bottom: 15px;
}
.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
  margin-bottom: 0;
}
.checkbox-label input[type='checkbox'] {
  width: auto;
  margin: 0;
  margin-right: 8px;
  cursor: pointer;
}
.checkmark {
  margin-left: 4px;
}


.btn {
  width: 100%;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 27px;
  padding-top: 12px;
  padding-bottom: 12px;
  font-size: 16px;
}

.login-btn {
  /* 공통 버튼 스타일 적용 */
  /* .btn, .btn-primary 클래스가 이미 import되어 있으므로 별도 스타일 최소화 */
}

.warning-message {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 12px;
  border-radius: 6px;
  margin-top: 15px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.warning-message i {
  color: #f39c12;
}

.block-message {
  background-color: #f8d7da;
  border: 1px solid #f1aeb5;
  color: #721c24;
  padding: 15px;
  border-radius: 6px;
  margin-top: 15px;
  font-size: 14px;
  text-align: center;
  line-height: 1.5;
}
.block-message i {
  color: #dc3545;
  margin-bottom: 5px;
  display: block;
  font-size: 18px;
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  opacity: 0;
  height: 0;
  overflow: hidden;
  transition: all 0.2s ease;
}
.error-message.show {
  opacity: 1;
  height: auto;
  margin-top: 5px;
}


.change-password-link {
  font-size: 14px;
  color: #007bff;
  text-decoration: underline;
  margin-left: 12px;
  cursor: pointer;
  transition: color 0.2s;
  background: none;
  border: none;
  padding: 0;
  outline: none;
}
.change-password-link:focus {
  outline: none;
}
.change-password-link:hover {
  color: #0056b3;
}

.loading-spinner {
  margin-top: 12px;
  color: #007bff;
  font-size: 15px;
  text-align: center;
}

@media (max-width: 768px) {
  .login-container {
    padding: 16px 8px;
    max-width: 100%;
  }
  .form-group input {
    font-size: 15px;
    padding: 10px 12px;
  }
  .btn {
    font-size: 15px;
    padding: 10px 12px;
  }
}
@media (max-width: 480px) {
  .login-container {
    padding: 8px 2px;
  }
  .form-group input {
    font-size: 14px;
    padding: 8px 8px;
  }
  .btn {
    font-size: 14px;
    padding: 8px 8px;
  }
}
</style>
