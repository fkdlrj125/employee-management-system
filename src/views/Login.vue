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

        <!-- 테스트 계정 안내 -->
        <div class="test-info">
          <p><strong>테스트 계정:</strong></p>
          <p>ID: admin / PW: admin</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

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
  },
  methods: {
    ...mapActions('auth', ['login']),

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
          console.error('로그인 오류:', error);
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
.main-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.login-header p {
  color: #7f8c8d;
  margin: 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
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
  transition: color 0.3s ease;
}

.password-toggle:hover:not(:disabled) {
  color: #495057;
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.checkbox-group {
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

.btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn .fas {
  margin-right: 6px;
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  opacity: 0;
  height: 0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.error-message.show {
  opacity: 1;
  height: auto;
  margin-top: 5px;
}

.test-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  color: #0066cc;
}
</style>
