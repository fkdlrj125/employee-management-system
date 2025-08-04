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
  origin: process.env.FRONTEND_URL || 'http://localhost:8082',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // IP당 최대 100 요청
  message: {
    success: false,
    message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.'
  }
})
app.use('/api', limiter)

// Body Parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 정적 파일 서빙 (업로드된 이미지)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// 로깅 미들웨어
app.use(logger)

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/employees', employeeRoutes)

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
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8082'}`)
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
