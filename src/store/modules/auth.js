import EmployeeApiService from '@/services/EmployeeApiService';
import router from '@/router';

const state = {
  token: sessionStorage.getItem('token') || null,
  user: null, // 사용자 정보는 세션스토리지에 저장하지 않음
  loading: false,
  error: null,
};

const getters = {
  isAuthenticated: (state) => !!state.token,
  authUser: (state) => state.user,
  authToken: (state) => state.token,
  isAuthLoading: (state) => state.loading,
  authError: (state) => state.error,
  currentUser: (state) => state.user,
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
    // 사용자 정보는 세션스토리지에 저장하지 않음
  },
  LOGOUT(state) {
    state.token = null;
    state.user = null;
    sessionStorage.removeItem('token');
    // 사용자 정보는 세션스토리지에 저장하지 않음
  },
};

const actions = {
  // 세션스토리지에서 토큰만 store에 반영 (앱 시작시 등)
  async initAuth({ commit, dispatch }) {
    const token = sessionStorage.getItem('token');
    if (token) {
      commit('SET_TOKEN', token);
      // 토큰으로 사용자 정보 조회
      try {
        const res = await EmployeeApiService.api.get('/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.user) {
          commit('SET_USER', res.data.user);
          // 권한에 따라 필터 설정
          if (res.data.user.role === 'admin') {
            dispatch('employee/setFilters', { department: '' }, { root: true });
          } else {
            dispatch('employee/setFilters', { department: res.data.user.department }, { root: true });
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
        // 토큰으로 사용자 정보 조회
        let userInfo = null;
        try {
          const verifyRes = await EmployeeApiService.api.get('/auth/verify', {
            headers: { Authorization: `Bearer ${res.data.token}` }
          });
          if (verifyRes.data && verifyRes.data.user) {
            userInfo = verifyRes.data.user;
            commit('SET_USER', userInfo);
            // 권한에 따라 필터 설정
            if (userInfo.role === 'admin') {
              await dispatch('employee/setFilters', { department: '' }, { root: true });
            } else {
              await dispatch('employee/setFilters', { department: userInfo.department }, { root: true });
            }
          }
        } catch (e) {
          commit('SET_USER', null);
        }
        await dispatch('employee/fetchEmployees', null, { root: true });
        router.push('/employee-list');
        return { success: true, user: userInfo };
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