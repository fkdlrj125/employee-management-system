/**
 * Employee Routes
 * API 엔드포인트 정의
 */
const express = require('express')
const { body } = require('express-validator')
const EmployeeController = require('../controllers/EmployeeController')
const authMiddleware = require('../middlewares/authMiddleware')
const uploadMiddleware = require('../middlewares/uploadMiddleware')

const router = express.Router()
const employeeController = new EmployeeController()

// 유효성 검사 규칙
const employeeValidationRules = [
  body('data').custom((value) => {
    try {
      const data = JSON.parse(value)
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('이름은 필수입니다.')
      }
      if (!data.department || data.department.trim().length === 0) {
        throw new Error('부서는 필수입니다.')
      }
      if (!data.position || data.position.trim().length === 0) {
        throw new Error('직급은 필수입니다.')
      }
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new Error('올바른 이메일 형식이 아닙니다.')
      }
      return true
    } catch (error) {
      throw new Error('유효하지 않은 데이터 형식입니다.')
    }
  })
]

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware)

// GET /api/employees - 직원 목록 조회
router.get('/', (req, res) => employeeController.getEmployees(req, res))

// GET /api/employees/:id - 직원 상세 조회
router.get('/:id', (req, res) => employeeController.getEmployeeById(req, res))

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

// DELETE /api/employees/:id - 직원 삭제
router.delete('/:id', (req, res) => employeeController.deleteEmployee(req, res))

// GET /api/employees/meta/departments - 부서 목록 조회
router.get('/meta/departments', (req, res) => employeeController.getDepartments(req, res))

// GET /api/employees/meta/positions - 직급 목록 조회
router.get('/meta/positions', (req, res) => employeeController.getPositions(req, res))

module.exports = router
