/**
 * Employee Model (MVC Pattern)
 * 데이터베이스와의 상호작용을 담당
 */
const mysql = require('mysql2/promise')
const config = require('../config/database')

class EmployeeModel {
  constructor() {
    this.db = null
    this.initConnection()
  }

  async initConnection() {
    try {
      this.db = await mysql.createConnection(config.database)
      console.log('Database connected successfully')
    } catch (error) {
      console.error('Database connection failed:', error)
      throw error
    }
  }

  // 모든 직원 조회 (페이지네이션, 필터링 포함)
  async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      department = '',
      position = '',
      search = ''
    } = options

    let query = `
      SELECT 
        e.*,
        COUNT(*) OVER() as total_count
      FROM employees e
      WHERE 1=1
    `
    const params = []

    // 필터 조건 추가
    if (department) {
      query += ' AND e.department = ?'
      params.push(department)
    }

    if (position) {
      query += ' AND e.position = ?'
      params.push(position)
    }

    if (search) {
      query += ' AND (e.name LIKE ? OR e.email LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    // 페이지네이션
    const offset = (page - 1) * limit
    query += ' ORDER BY e.id DESC LIMIT ? OFFSET ?'
    params.push(parseInt(limit), parseInt(offset))

    try {
      const [rows] = await this.db.execute(query, params)
      const totalCount = rows.length > 0 ? rows[0].total_count : 0
      
      // total_count 필드 제거
      const employees = rows.map(row => {
        const { total_count, ...employee } = row
        return employee
      })

      return {
        employees,
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      throw error
    }
  }

  // ID로 직원 조회 (관련 데이터 포함)
  async findById(id) {
    try {
      // 기본 직원 정보
      const [employeeRows] = await this.db.execute(
        'SELECT * FROM employees WHERE id = ?',
        [id]
      )

      if (employeeRows.length === 0) {
        return null
      }

      const employee = employeeRows[0]

      // 관련 데이터 조회
      const [educations] = await this.db.execute(
        'SELECT * FROM educations WHERE employee_id = ? ORDER BY start_date DESC',
        [id]
      )

      const [certificates] = await this.db.execute(
        'SELECT * FROM certificates WHERE employee_id = ? ORDER BY issue_date DESC',
        [id]
      )

      const [careers] = await this.db.execute(
        'SELECT * FROM careers WHERE employee_id = ? ORDER BY start_date DESC',
        [id]
      )

      const [projects] = await this.db.execute(
        'SELECT * FROM projects WHERE employee_id = ? ORDER BY start_date DESC',
        [id]
      )

      return {
        ...employee,
        educations,
        certificates,
        careers,
        projects
      }
    } catch (error) {
      console.error('Error fetching employee by ID:', error)
      throw error
    }
  }

  // 직원 생성
  async create(employeeData) {
    const connection = await this.db.getConnection()
    
    try {
      await connection.beginTransaction()

      // 직원 기본 정보 저장
      const [result] = await connection.execute(`
        INSERT INTO employees (
          name, department, position, email, phone, address, birth,
          photo_url, career_years, eus_career, workplace, skills
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        employeeData.name,
        employeeData.department,
        employeeData.position,
        employeeData.email,
        employeeData.phone,
        employeeData.address,
        employeeData.birth,
        employeeData.photoUrl,
        employeeData.career_years,
        employeeData.eus_career,
        employeeData.workplace,
        employeeData.skills
      ])

      const employeeId = result.insertId

      // 관련 데이터 저장
      if (employeeData.educations?.length > 0) {
        await this.saveEducations(connection, employeeId, employeeData.educations)
      }

      if (employeeData.certificates?.length > 0) {
        await this.saveCertificates(connection, employeeId, employeeData.certificates)
      }

      if (employeeData.careers?.length > 0) {
        await this.saveCareers(connection, employeeId, employeeData.careers)
      }

      if (employeeData.projects?.length > 0) {
        await this.saveProjects(connection, employeeId, employeeData.projects)
      }

      await connection.commit()
      
      // 생성된 직원 정보 반환
      return await this.findById(employeeId)
    } catch (error) {
      await connection.rollback()
      console.error('Error creating employee:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  // 직원 수정
  async update(id, employeeData) {
    const connection = await this.db.getConnection()
    
    try {
      await connection.beginTransaction()

      // 직원 기본 정보 수정
      await connection.execute(`
        UPDATE employees SET
          name = ?, department = ?, position = ?, email = ?, phone = ?,
          address = ?, birth = ?, photo_url = ?, career_years = ?,
          eus_career = ?, workplace = ?, skills = ?
        WHERE id = ?
      `, [
        employeeData.name,
        employeeData.department,
        employeeData.position,
        employeeData.email,
        employeeData.phone,
        employeeData.address,
        employeeData.birth,
        employeeData.photoUrl,
        employeeData.career_years,
        employeeData.eus_career,
        employeeData.workplace,
        employeeData.skills,
        id
      ])

      // 관련 데이터 삭제 후 재생성
      await connection.execute('DELETE FROM educations WHERE employee_id = ?', [id])
      await connection.execute('DELETE FROM certificates WHERE employee_id = ?', [id])
      await connection.execute('DELETE FROM careers WHERE employee_id = ?', [id])
      await connection.execute('DELETE FROM projects WHERE employee_id = ?', [id])

      // 관련 데이터 저장
      if (employeeData.educations?.length > 0) {
        await this.saveEducations(connection, id, employeeData.educations)
      }

      if (employeeData.certificates?.length > 0) {
        await this.saveCertificates(connection, id, employeeData.certificates)
      }

      if (employeeData.careers?.length > 0) {
        await this.saveCareers(connection, id, employeeData.careers)
      }

      if (employeeData.projects?.length > 0) {
        await this.saveProjects(connection, id, employeeData.projects)
      }

      await connection.commit()
      
      // 수정된 직원 정보 반환
      return await this.findById(id)
    } catch (error) {
      await connection.rollback()
      console.error('Error updating employee:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  // 직원 삭제
  async delete(id) {
    const connection = await this.db.getConnection()
    
    try {
      await connection.beginTransaction()

      // 관련 데이터 삭제
      await connection.execute('DELETE FROM educations WHERE employee_id = ?', [id])
      await connection.execute('DELETE FROM certificates WHERE employee_id = ?', [id])
      await connection.execute('DELETE FROM careers WHERE employee_id = ?', [id])
      await connection.execute('DELETE FROM projects WHERE employee_id = ?', [id])

      // 직원 삭제
      const [result] = await connection.execute('DELETE FROM employees WHERE id = ?', [id])

      await connection.commit()
      
      return result.affectedRows > 0
    } catch (error) {
      await connection.rollback()
      console.error('Error deleting employee:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  // 학력 저장
  async saveEducations(connection, employeeId, educations) {
    for (const education of educations) {
      await connection.execute(`
        INSERT INTO educations (employee_id, school, major, degree, start_date, end_date, grade)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [employeeId, education.school, education.major, education.degree, 
          education.startDate, education.endDate, education.grade])
    }
  }

  // 자격증 저장
  async saveCertificates(connection, employeeId, certificates) {
    for (const cert of certificates) {
      await connection.execute(`
        INSERT INTO certificates (employee_id, name, issuer, issue_date, expiry_date, score)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [employeeId, cert.name, cert.issuer, cert.issueDate, cert.expiryDate, cert.score])
    }
  }

  // 경력 저장
  async saveCareers(connection, employeeId, careers) {
    for (const career of careers) {
      await connection.execute(`
        INSERT INTO careers (employee_id, company, department, position, start_date, end_date, duties)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [employeeId, career.company, career.department, career.position,
          career.startDate, career.endDate, career.duties])
    }
  }

  // 프로젝트 저장
  async saveProjects(connection, employeeId, projects) {
    for (const project of projects) {
      await connection.execute(`
        INSERT INTO projects (employee_id, name, client, role, start_date, end_date, technologies, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [employeeId, project.name, project.client, project.role,
          project.startDate, project.endDate, project.technologies, project.description])
    }
  }
}

module.exports = EmployeeModel
