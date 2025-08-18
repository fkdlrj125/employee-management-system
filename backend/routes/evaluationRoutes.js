// backend/routes/evaluationRoutes.js
const express = require('express')
const EvaluationController = require('../controllers/EvaluationController')
const authMiddleware = require('../middlewares/authMiddleware')

const router = express.Router()
const evaluationController = new EvaluationController()

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware)

// GET /api/evaluations/:id - 직원별 평가 이력 조회
router.get('/:id', (req, res) => evaluationController.getEvaluationHistory(req, res))
// POST /api/evaluations - 평가 이력 등록 또는 수정(연월 중복 시 update)
router.post('/:id', (req, res) => evaluationController.upsertEvaluation(req, res))

// POST /api/evaluations/leader/:id - 리더 평가 이력 등록 또는 수정
router.post('/leader/:id', (req, res) => evaluationController.upsertLeaderEvaluation(req, res))

module.exports = router
