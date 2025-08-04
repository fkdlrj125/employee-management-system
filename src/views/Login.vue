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
            :disabled="loading"
          >
          <div class="error-message" :class="{ show: usernameError }">{{ usernameError }}</div>
        </div>
        
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="비밀번호를 입력하세요" 
            required
            :disabled="loading"
          >
          <div class="error-message" :class="{ show: passwordError }">{{ passwordError }}</div>
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary login-btn"
          :disabled="loading"
        >
          {{ loading ? '로그인 중...' : '로그인' }}
        </button>
        
        <div v-if="error" class="error-message show" style="margin-top: 15px;">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      usernameError: '',
      passwordError: '',
      loading: false
    }
  },
  computed: {
    ...mapGetters('auth', ['authError']),
    error() {
      return this.authError
    }
  },
  methods: {
    ...mapActions('auth', ['login']),
    
    async handleLogin() {
      // 입력값 검증
      this.validateForm()
      
      if (!this.usernameError && !this.passwordError) {
        this.loading = true
        
        // ===== 실제 API 로그인 코드 (주석처리) =====
        // const result = await this.login({
        //   username: this.username,
        //   password: this.password
        // })
        // 
        // this.loading = false
        // 
        // if (result.success) {
        //   this.$router.push('/employee-list')
        // }
        // ===== 실제 API 로그인 코드 끝 =====
        
        // ===== 임시 데모용 로그인 코드 =====
        // 임시로 토큰 없이 바로 로그인 처리
        // 가짜 토큰과 사용자 정보 생성
        const fakeToken = 'fake-token-for-demo'
        const fakeUser = {
          id: 1,
          username: this.username,
          name: this.username,
          email: `${this.username}@company.com`
        }
        
        // 세션에 토큰 저장
        sessionStorage.setItem('token', fakeToken)
        
        // 스토어에 인증 정보 저장
        this.$store.commit('auth/AUTH_SUCCESS', { 
          token: fakeToken, 
          user: fakeUser 
        })
        
        this.loading = false
        
        // 직원 목록 페이지로 이동
        this.$router.push('/employee-list')
        // ===== 임시 데모용 로그인 코드 끝 =====
      }
    },
    
    validateForm() {
      // 유효성 검사 로직
      this.usernameError = !this.username.trim() ? '아이디를 입력해주세요.' : ''
      this.passwordError = !this.password ? '비밀번호를 입력해주세요.' : ''
    }
  }
}
</script>