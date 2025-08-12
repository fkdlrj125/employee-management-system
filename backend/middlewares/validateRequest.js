// 요청 유효성 검사 미들웨어 (express-validator 활용 예시)
const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '요청 데이터가 유효하지 않습니다.',
      errors: errors.array(),
    });
  }
  next();
};
