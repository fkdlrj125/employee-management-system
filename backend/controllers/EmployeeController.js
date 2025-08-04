/**
 * Employee Controller (MVC Pattern)
 * 요청 처리 및 응답 로직을 담당
 */
const EmployeeModel = require('../models/EmployeeModel')
const { validationResult } = require('express-validator')

class EmployeeController {
  constructor() {
    this.employeeModel = new EmployeeModel()
  }

  // 직원 목록 조회
  async getEmployees(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        department = '',
        position = '',
        search = ''
      } = req.query

      const result = await this.employeeModel.findAll({
        page: parseInt(page),
        limit: parseInt(limit),
        department,
        position,
        search
      })

      res.json({
        success: true,
        message: '직원 목록을 성공적으로 조회했습니다.',
        employees: result.employees,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      })
    } catch (error) {
      console.error('Get employees error:', error)
      res.status(500).json({
        success: false,
        message: '직원 목록 조회에 실패했습니다.',
        error: error.message
      })
    }
  }

  // 직원 상세 조회
  async getEmployeeById(req, res) {
    try {
      const { id } = req.params

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: '유효하지 않은 직원 ID입니다.'
        })
      }

      const employee = await this.employeeModel.findById(parseInt(id))

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: '직원을 찾을 수 없습니다.'
        })
      }

      res.json({
        success: true,
        message: '직원 정보를 성공적으로 조회했습니다.',
        employee
      })
    } catch (error) {
      console.error('Get employee by ID error:', error)
      res.status(500).json({
        success: false,
        message: '직원 정보 조회에 실패했습니다.',
        error: error.message
      })
    }
  }

  // 직원 생성
  async createEmployee(req, res) {
    try {
      // 유효성 검사 결과 확인
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '입력 데이터가 유효하지 않습니다.',
          errors: errors.array()
        })
      }

      // 파일 업로드 처리
      let photoUrl = null
      if (req.file) {
        photoUrl = `/uploads/${req.file.filename}`
      }

      // JSON 데이터 파싱
      const employeeData = JSON.parse(req.body.data)
      employeeData.photoUrl = photoUrl

      const employee = await this.employeeModel.create(employeeData)

      res.status(201).json({
        success: true,
        message: '직원이 성공적으로 생성되었습니다.',
        employee
      })
    } catch (error) {
      console.error('Create employee error:', error)
      res.status(500).json({
        success: false,
        message: '직원 생성에 실패했습니다.',
        error: error.message
      })
    }
  }

  // 직원 수정
  async updateEmployee(req, res) {
    try {
      const { id } = req.params

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: '유효하지 않은 직원 ID입니다.'
        })
      }

      // 유효성 검사 결과 확인
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '입력 데이터가 유효하지 않습니다.',
          errors: errors.array()
        })
      }

      // 기존 직원 확인
      const existingEmployee = await this.employeeModel.findById(parseInt(id))
      if (!existingEmployee) {
        return res.status(404).json({
          success: false,
          message: '직원을 찾을 수 없습니다.'
        })
      }

      // 파일 업로드 처리
      let photoUrl = existingEmployee.photo_url
      if (req.file) {
        photoUrl = `/uploads/${req.file.filename}`
      }

      // JSON 데이터 파싱
      const employeeData = JSON.parse(req.body.data)
      employeeData.photoUrl = photoUrl

      const employee = await this.employeeModel.update(parseInt(id), employeeData)

      res.json({
        success: true,
        message: '직원 정보가 성공적으로 수정되었습니다.',
        employee
      })
    } catch (error) {
      console.error('Update employee error:', error)
      res.status(500).json({
        success: false,
        message: '직원 수정에 실패했습니다.',
        error: error.message
      })
    }
  }

  // 직원 삭제
  async deleteEmployee(req, res) {
    try {
      const { id } = req.params

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: '유효하지 않은 직원 ID입니다.'
        })
      }

      // 기존 직원 확인
      const existingEmployee = await this.employeeModel.findById(parseInt(id))
      if (!existingEmployee) {
        return res.status(404).json({
          success: false,
          message: '직원을 찾을 수 없습니다.'
        })
      }

      const success = await this.employeeModel.delete(parseInt(id))

      if (success) {
        res.json({
          success: true,
          message: '직원이 성공적으로 삭제되었습니다.'
        })
      } else {
        res.status(500).json({
          success: false,
          message: '직원 삭제에 실패했습니다.'
        })
      }
    } catch (error) {
      console.error('Delete employee error:', error)
      res.status(500).json({
        success: false,
        message: '직원 삭제에 실패했습니다.',
        error: error.message
      })
    }
  }

  // 부서 목록 조회
  async getDepartments(req, res) {
    try {
      // 실제로는 데이터베이스에서 조회해야 함
      const departments = ['DSS1', 'DSS2', 'CSC', 'HR', '개발팀', '기획팀', '영업팀']
      
      res.json({
        success: true,
        message: '부서 목록을 성공적으로 조회했습니다.',
        departments
      })
    } catch (error) {
      console.error('Get departments error:', error)
      res.status(500).json({
        success: false,
        message: '부서 목록 조회에 실패했습니다.',
        error: error.message
      })
    }
  }

  // 직급 목록 조회
  async getPositions(req, res) {
    try {
      // 실제로는 데이터베이스에서 조회해야 함
      const positions = ['사원', '주임', '대리', '과장', '차장', '부장', '임원']
      
      res.json({
        success: true,
        message: '직급 목록을 성공적으로 조회했습니다.',
        positions
      })
    } catch (error) {
      console.error('Get positions error:', error)
      res.status(500).json({
        success: false,
        message: '직급 목록 조회에 실패했습니다.',
        error: error.message
      })
    }
  }
}

module.exports = EmployeeController
