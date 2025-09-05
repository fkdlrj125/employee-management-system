/**
 * Express App - MVC Backend
 * 직원관리시스템 백엔드 API 서버
 */
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const path = require('path')
require('dotenv').config()

// Routes
const employeeRoutes = require('./routes/employeeRoutes')
const evaluationRoutes = require('./routes/evaluationRoutes')
const authRoutes = require('./routes/authRoutes')

// Middlewares
const errorHandler = require('./middlewares/errorHandler')
const logger = require('./middlewares/logger')

const app = express()
const PORT = process.env.PORT || 3000

// 보안 및 성능 미들웨어
app.use(helmet())
app.use(compression())

// CORS 설정
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://59.6.197.113:8000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Rate Limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 100, // IP당 최대 500 요청
  message: {
    success: false,
    message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.'
  }
})
app.use('/api', limiter)

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 5, // 1분에 5회/IP
  message: {
    success: false,
    message: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.'
  }
});

// 로그인 라우트에만 적용
app.use('/api/auth/login', loginLimiter);

// Body Parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 정적 파일 서빙 (업로드된 이미지)
app.use('/uploads', cors({
  origin: process.env.FRONTEND_URL || 'http://59.6.197.113:8000',
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin']
}), express.static(path.join(__dirname, 'uploads')))

// 로깅 미들웨어
app.use(logger)

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/evaluations', evaluationRoutes)

// Health Check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '요청한 리소스를 찾을 수 없습니다.',
    path: req.originalUrl
  })
})

// 에러 핸들러
app.use(errorHandler)

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://59.6.197.113:8000'}`)
})

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...')
  process.exit(0)
})

module.exports = app
