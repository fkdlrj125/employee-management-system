import axios from 'axios'
import router from '@/router'

const state = {
  token: sessionStorage.getItem('token') || null,
  user: JSON.parse(sessionStorage.getItem('user') || 'null'),
  loading: false,
  error: null
}

const getters = {
  isAuthenticated: state => !!state.token,
  currentUser: state => state.user,
  authError: state => state.error
}

const mutations = {
  AUTH_REQUEST(state) {
    state.loading = true
    state.error = null
  },
  AUTH_SUCCESS(state, { token, user }) {
    state.token = token
    state.user = user
    state.loading = false
    state.error = null
  },
  AUTH_ERROR(state, error) {
    state.loading = false
    state.error = error
  },
  CLEAR_AUTH(state) {
    state.token = null
    state.user = null
  }
}

const actions = {
  async login({ commit }, credentials) {
    commit('AUTH_REQUEST')
    try {
      // ===== 임시 데모용 더미 로그인 =====
      // 간단한 테스트 계정 허용
      if (credentials.username === 'admin' && credentials.password === 'admin') {
        const token = 'dummy-jwt-token'
        const user = { username: 'admin', role: 'admin' }
        
        sessionStorage.setItem('token', token)
        sessionStorage.setItem('user', JSON.stringify(user))
        
        commit('AUTH_SUCCESS', { token, user })
        
        return { success: true }
      } else {
        throw new Error('잘못된 사용자명 또는 비밀번호입니다.')
      }
      // ===== 임시 데모용 더미 로그인 끝 =====
      
      // ===== 실제 API 호출 코드 (주석처리) =====
      // const response = await axios.post('/api/auth/login', credentials)
      // 
      // if (response.data.success && response.data.token) {
      //   // 토큰 저장
      //   const token = response.data.token
      //   sessionStorage.setItem('token', token)
      //   
      //   // 헤더에 토큰 설정
      //   axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      //   
      //   // 유저 정보 파싱 (JWT에서)
      //   const base64Url = token.split('.')[1]
      //   const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      //   const user = JSON.parse(window.atob(base64))
      //   
      //   commit('AUTH_SUCCESS', { token, user })
      //   
      //   return { success: true }
      // } else {
      //   throw new Error(response.data.message || '로그인에 실패했습니다.')
      // }
      // ===== 실제 API 호출 코드 끝 =====
    } catch (error) {
      commit('AUTH_ERROR', error.message || '로그인에 실패했습니다.')
      sessionStorage.removeItem('token')
      return { success: false, message: error.message }
    }
  },
  
  logout({ commit }) {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    commit('CLEAR_AUTH')
    router.push('/login')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}