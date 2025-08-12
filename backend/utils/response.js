// 표준 API 응답 유틸리티
module.exports = {
  success(data = {}, message = '성공') {
    return {
      success: true,
      message,
      ...data,
    };
  },
  error(message = '오류 발생', error = null) {
    return {
      success: false,
      message,
      error,
    };
  },
};
