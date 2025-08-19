// EvaluationApiService.js
// 평가(evaluations) 관련 API만 담당
import axios from 'axios';

class EvaluationApiService {
  constructor() {
    this.baseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api';
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    // 요청 인터셉터: JWT 토큰 자동 포함
    this.api.interceptors.request.use(
      (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }
  // 리더 기술역량 점수 저장 (리더 평가)
  async saveLeaderSkillScores(employeeId, { leaderSkillScores, evaluation_date, special_note, evaluated_by }) {
    try {
      const payload = { leaderSkillScores, evaluation_date };
      if (special_note) payload.special_note = special_note;
      if (evaluated_by) payload.evaluated_by = evaluated_by;
      const response = await this.api.post(`/evaluations/leader/${employeeId}`, payload);
      return {
        success: response.data.success,
        data: response.data,
        message: response.data.message,
      };
    } catch (error) {
      return this.handleError(error, '리더 기술역량 점수 저장에 실패했습니다.');
    }
  }

  // 기술역량 점수 저장 (평가)
  async saveSkillScores(employeeId, { skillScores, leaderSkillScores, evaluation_date }) {
    try {
      // special_note, evaluated_by도 전달
      const payload = { skillScores, leaderSkillScores, evaluation_date };
      if (arguments[1].special_note) payload.special_note = arguments[1].special_note;
      if (arguments[1].evaluated_by) payload.evaluated_by = arguments[1].evaluated_by;
      const response = await this.api.post(`/evaluations/${employeeId}`, payload);
      return {
        success: response.data.success,
        data: response.data,
        message: response.data.message,
      };
    } catch (error) {
      return this.handleError(error, '기술역량 점수 저장에 실패했습니다.');
    }
  }
    // 리더 평가점수 이력 조회
  async getLeaderEvaluationHistory(employeeId, year = null) {
    try {
      let url = `/evaluations/leader/${employeeId}`;
      if (year) {
        url += `?year=${year}`;
      }
      const response = await this.api.get(url);
      // 배열 형태로 바로 반환되는 경우 보정
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (Array.isArray(response.data.data)) {
        return response.data.data;
      }
      // 혹시 객체로 오면 배열로 래핑
      if (response.data && typeof response.data === 'object') {
        return [response.data];
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  // 연도별 평가점수 이력 조회
  async getEvaluationHistory(employeeId, year = null) {
    try {
      let url = `/evaluations/${employeeId}`;
      if (year) {
        url += `?year=${year}`;
      }
      const response = await this.api.get(url);
      // 배열 형태로 바로 반환되는 경우 보정
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (Array.isArray(response.data.data)) {
        return response.data.data;
      }
      // 혹시 객체로 오면 배열로 래핑
      if (response.data && typeof response.data === 'object') {
        return [response.data];
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  // 에러 처리
  handleError(error, defaultMessage) {
    let message = defaultMessage;
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }
    return {
      success: false,
      error: message,
      data: null,
    };
  }
}

export const evaluationApiService = new EvaluationApiService();
export default evaluationApiService;
