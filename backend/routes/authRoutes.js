
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'your-secret-key';
const { executeQuery } = require('../utils/database');

// DB 연동 로그인 (username 기반, bcrypt, JWT)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: '아이디와 비밀번호를 모두 입력하세요.' });
  }
  try {
    // users 테이블에서 username으로 사용자 조회
    const result = await executeQuery('SELECT * FROM users WHERE username = ?', [username]);
    if (!result.success) {
      return res.status(500).json({ success: false, message: 'DB 조회 오류', error: result.error });
    }
    const user = result.data[0];
    if (!user) {
      return res.status(401).json({ success: false, message: '존재하지 않는 사용자입니다.' });
    }
    // bcrypt로 비밀번호 검증
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }
    // JWT 발급 (id, username, department, role 등 payload)
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        department: user.department,
        role: user.role || 'user',
        created_at: user.created_at
      },
      SECRET,
      { expiresIn: '2h' }
    );
    // 응답: 토큰 + 최소 사용자 정보
    res.json({
      success: true,
      message: '로그인 성공',
      token,
      user: {
        id: user.id,
        username: user.username,
        department: user.department,
        role: user.role || 'user',
        created_at: user.created_at
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: '서버 오류', error: err.message });
  }
});

// 토큰 검증 (JWT)
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '인증 토큰이 필요합니다.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    res.json({ success: true, message: '토큰 유효', user: decoded });
  } catch (err) {
    res.status(401).json({ success: false, message: '유효하지 않은 토큰입니다.' });
  }
});

module.exports = router;
