import EmployeeApiService from '@/services/EmployeeApiService';
import router from '@/router';

const state = {
  token: sessionStorage.getItem('token') || null,
  user: JSON.parse(sessionStorage.getItem('user') || 'null'),
  loading: false,
  error: null,
};

const getters = {
  isAuthenticated: (state) => !!state.token,
  authUser: (state) => state.user,
  authToken: (state) => state.token,
  isAuthLoading: (state) => state.loading,
  authError: (state) => state.error,
  currentUser: (state) => state.user, // 호환성용
};

const mutations = {
  SET_AUTH_LOADING(state, status) {
    state.loading = status;
  },
  SET_AUTH_ERROR(state, error) {
    state.error = error;
  },
  SET_TOKEN(state, token) {
    state.token = token;
    if (token) {
      sessionStorage.setItem('token', token);
    } else {
      sessionStorage.removeItem('token');
    }
  },
  SET_USER(state, user) {
    state.user = user;
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('user');
    }
  },
  LOGOUT(state) {
    state.token = null;
    state.user = null;
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  },
};

const actions = {
  // 세션스토리지에서 토큰/유저를 store에 반영 (앱 시작시 등)
  initAuth({ commit, dispatch }) {
    const token = sessionStorage.getItem('token');
    const user = sessionStorage.getItem('user');
    if (token) {
      commit('SET_TOKEN', token);
    }
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        commit('SET_USER', parsedUser);
        // 새로고침 시에도 부서 필터 고정
        if (parsedUser) {
          if (parsedUser.role === 'admin') {
            dispatch('employee/setFilters', { department: '' }, { root: true });
          } else {
            dispatch('employee/setFilters', { department: parsedUser.role }, { root: true });
          }
        }
      } catch (e) {
        commit('SET_USER', null);
      }
    }
  },
  async login({ commit, dispatch }, { username, password }) {
    commit('SET_AUTH_LOADING', true);
    commit('SET_AUTH_ERROR', null);
    try {
      const res = await EmployeeApiService.api.post('/auth/login', { username, password });
      if (res.data && res.data.token) {
        commit('SET_TOKEN', res.data.token);
        commit('SET_USER', res.data.user || null);
        // 디버깅: 로그인 유저 정보 로그 출력
        console.log('[auth.js:login] 로그인 유저:', res.data.user);
        // admin이면 전체, 아니면 본인 부서로 필터 고정
        if (res.data.user) {
          if (res.data.user.role === 'admin') {
            console.log('[auth.js:login] department set to: (admin, 전체)');
            await dispatch('employee/setFilters', { department: '' }, { root: true });
          } else if (res.data.user.role) {
            console.log('[auth.js:login] department set to:', res.data.user.role);
            await dispatch('employee/setFilters', { department: res.data.user.role }, { root: true });
          }
        }
        await dispatch('employee/fetchEmployees', null, { root: true });
        // 토큰/유저 세팅 후 라우터 이동
        router.push('/employee-list');
        return { success: true, user: res.data.user };
      } else {
        commit('SET_AUTH_ERROR', res.data?.message || '로그인에 실패했습니다.');
        return { success: false, error: res.data?.message };
      }
    } catch (error) {
      commit('SET_AUTH_ERROR', error.response?.data?.message || error.message || '로그인에 실패했습니다.');
      return { success: false, error: error.message };
    } finally {
      commit('SET_AUTH_LOADING', false);
    }
  },
  async logout({ commit, dispatch }) {
    commit('LOGOUT');
    await dispatch('employee/resetState', null, { root: true });
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
