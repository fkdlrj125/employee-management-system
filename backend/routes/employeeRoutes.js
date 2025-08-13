
/**
 * Employee Routes
 * API 엔드포인트 정의
 */
const express = require('express')
const { body } = require('express-validator')
const EmployeeController = require('../controllers/EmployeeController')
// 평가 이력 컨트롤러 (직원별 평가 이력)
const EvaluationController = require('../controllers/EvaluationController')

const authMiddleware = require('../middlewares/authMiddleware')
const uploadMiddleware = require('../middlewares/uploadMiddleware')

const router = express.Router()
const employeeController = new EmployeeController()
const evaluationController = new EvaluationController()
// 유효성 검사 규칙
const employeeValidationRules = [
  body('name').notEmpty().withMessage('이름은 필수입니다.'),
  body('department').notEmpty().withMessage('부서는 필수입니다.'),
  body('position').notEmpty().withMessage('직급은 필수입니다.'),
  body('email').optional().isEmail().withMessage('올바른 이메일 형식이 아닙니다.')
]

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware)


// GET /api/employees - 직원 목록 조회
router.get('/', (req, res) => employeeController.getEmployees(req, res))

// POST /api/employees - 직원 생성
router.post('/', 
  uploadMiddleware.single('photo'),
  employeeValidationRules,
  (req, res) => employeeController.createEmployee(req, res)
)

// PUT /api/employees/:id - 직원 수정
router.put('/:id',
  uploadMiddleware.single('photo'),
  employeeValidationRules,
  (req, res) => employeeController.updateEmployee(req, res)
)

// PUT /api/employees/:id/skill-scores - 기술역량 점수만 저장
router.put('/:id/skill-scores', (req, res) => employeeController.updateSkillScores(req, res))

// DELETE /api/employees/:id - 직원 삭제
router.delete('/:id', (req, res) => employeeController.deleteEmployee(req, res))

// GET /api/employees/meta/departments - 부서 목록 조회
router.get('/meta/departments', (req, res) => employeeController.getDepartments(req, res))

// GET /api/employees/meta/positions - 직급 목록 조회
router.get('/meta/positions', (req, res) => employeeController.getPositions(req, res))

// GET /api/employees/:id - 직원 상세 조회 (가장 마지막에 위치해야 함)
router.get('/:id', (req, res) => employeeController.getEmployeeById(req, res))

module.exports = router
