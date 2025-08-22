const express = require('express');
const nodemailer = require('nodemailer');
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

// 부서 관리자 이메일 반환 예시 함수 (실제 DB 연동 필요)
function getDeptAdminEmail(department) {
  const deptAdminMap = {
    'DSS1': 'mitmasljh@mitmas.com',
    'DSS2': 'devadmin@example.com',
    'CSC': 'salesadmin@example.com',
    'HR': 'salesadmin@example.com',
    // ... 기타 부서
  };
  return deptAdminMap[department] || null;
}

// 메일 전송 예시 함수 (nodemailer 사용)
// 비밀번호 변경 링크 포함 메일 전송 (토큰 추가)
async function sendPasswordChangeMail(to, username, resetToken) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.hiworks.com',      // 하이웍스 SMTP 서버 주소
    port: 465,                     // SSL: 465, TLS: 587 (회사 정책에 따라 다를 수 있음)
    secure: true,                  // SSL이면 true, TLS면 false
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const resetUrl = `http://localhost:8080/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: '[비밀번호 변경 요청] ' + username,
    text:
      `사용자 ${username}의 비밀번호 변경 요청이 접수되었습니다.\n\n` +
      `비밀번호를 변경하려면 아래 링크를 클릭하세요:\n${resetUrl}\n\n` +
      `링크는 1시간 동안만 유효합니다.`,
    html:
      `<p>사용자 <b>${username}</b>의 비밀번호 변경 요청이 접수되었습니다.</p>` +
      `<p>비밀번호를 변경하려면 아래 링크를 클릭하세요:</p>` +
      `<a href="${resetUrl}">${resetUrl}</a>` +
      `<p style="color:#888;font-size:12px;">링크는 1시간 동안만 유효합니다.</p>`
  };
  await transporter.sendMail(mailOptions);
}

// 비밀번호 변경 토큰 검증 API
router.post('/verify-reset-token', async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, SECRET);
    res.json({ valid: true, username: decoded.username });
  } catch (err) {
    res.json({ valid: false });
  }
});

// 비밀번호 재설정 API (HR만 가능)
router.post('/reset-password', async (req, res) => {
  const { token, department, newPassword } = req.body;
  if (!token || !department || !newPassword) {
    return res.status(400).json({ success: false, message: '토큰, 부서, 새 비밀번호가 필요합니다.' });
  }
  try {
    // 토큰 검증 및 HR 권한 확인
    const decoded = jwt.verify(token, SECRET);
    if (!decoded.role || decoded.role.toLowerCase() !== 'hr') {
      return res.status(403).json({ success: false, message: 'HR 권한이 필요합니다.' });
    }
    // 해당 부서의 모든 사용자 조회
    const userResult = await executeQuery('SELECT username FROM users WHERE role = ?', [department]);
    if (!userResult.success) {
      return res.status(500).json({ success: false, message: 'DB 조회 오류', error: userResult.error });
    }
    const users = userResult.data;
    if (!users.length) {
      return res.status(404).json({ success: false, message: '해당 부서에 사용자가 없습니다.' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // 모든 사용자 비밀번호 일괄 변경
    for (const user of users) {
      await executeQuery('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, user.username]);
    }
    res.json({ success: true, message: `${department} 부서 모든 계정의 비밀번호가 변경되었습니다.` });
  } catch (err) {
    res.status(400).json({ success: false, message: '토큰이 만료되었거나 잘못되었습니다.' });
  }
});


module.exports = router;
