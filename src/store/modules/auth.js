import axios from 'axios';
import router from '@/router';

const state = {
  token: sessionStorage.getItem('token') || null,
  user: JSON.parse(sessionStorage.getItem('user') || 'null'),
  loading: false,
  error: null,
};

const getters = {
  isAuthenticated: (state) => !!state.token,
  currentUser: (state) => state.user,
  authError: (state) => state.error,
};

const mutations = {
  AUTH_REQUEST(state) {
    state.loading = true;
    state.error = null;
  },
  AUTH_SUCCESS(state, { token, user }) {
    state.token = token;
    state.user = user;
    state.loading = false;
    state.error = null;
  },
  AUTH_ERROR(state, error) {
    state.loading = false;
    state.error = error;
  },
  CLEAR_AUTH(state) {
    state.token = null;
    state.user = null;
  },
};

const actions = {
  initAuth({ commit }) {
    const token = sessionStorage.getItem('token');
    const user = sessionStorage.getItem('user');

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        commit('AUTH_SUCCESS', { token, user: parsedUser });
      } catch (error) {
        // 저장된 사용자 정보가 유효하지 않은 경우 초기화
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        commit('CLEAR_AUTH');
      }
    }
  },

  async login({ commit }, credentials) {
    commit('AUTH_REQUEST');
    try {
      // 테스트용 admin/admin 계정
      if (credentials.username === 'admin' && credentials.password === 'admin') {
        const token = 'demo-jwt-token-' + Date.now();
        const user = {
          id: 1,
          username: 'admin',
          name: '관리자',
          role: 'admin',
        };

        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        commit('AUTH_SUCCESS', { token, user });

        return { success: true };
      } else {
        throw new Error('잘못된 사용자명 또는 비밀번호입니다.');
      }
    } catch (error) {
      commit('AUTH_ERROR', error.message || '로그인에 실패했습니다.');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      return { success: false, message: error.message };
    }
  },

  logout({ commit }) {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    commit('CLEAR_AUTH');
    router.push('/login');
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
