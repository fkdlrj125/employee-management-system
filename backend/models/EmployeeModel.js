// 날짜 포맷 공통 함수
function formatDate(date) {
  if (!date) return '';
  if (typeof date === 'string') return date.slice(0, 10);
  return date.toISOString().slice(0, 10);
}
function formatMonth(date) {
  if (!date) return '';
  if (typeof date === 'string') return date.slice(0, 7);
  return date.toISOString().slice(0, 7);
}
/**
 * Employee Model (MVC Pattern)
 * 데이터베이스와의 상호작용을 담당
 */
const mysql = require('mysql2/promise')
const config = require('../config/database')
const { replaceUndefinedWithNull } = require('../utils/database')

class EmployeeModel {
  // 기술역량 점수만 별도 저장 (evaluations/leader_evaluations)
  async updateSkillScores(id, { skillScores, leaderSkillScores }) {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();
      const now = new Date();
      // 일반 평가 점수 저장 (evaluations)
      if (Array.isArray(skillScores) && skillScores.length === 6) {
        await connection.execute(
          `INSERT INTO evaluations (employee_id, evaluation_date, score1, score2, score3, score4, score5, score6)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            now,
            ...skillScores.map(Number)
          ]
        );
      }
      // 리더 평가 점수 저장 (leader_evaluations)
      if (Array.isArray(leaderSkillScores) && leaderSkillScores.length === 6) {
        await connection.execute(
          `INSERT INTO leader_evaluations (employee_id, evaluation_date, score1, score2, score3, score4, score5, score6)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            now,
            ...leaderSkillScores.map(Number)
          ]
        );
      }
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error('Error updating skill scores:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // 직원 성장 추이(기간별 성과) 집계
  async getPerformanceTrend({ employeeId, role, from, to }) {
    // 평가 테이블: evaluations
    // 평가일자: evaluation_date (DATE)
    // 월별로 그룹핑, score1~score6, total_score 평균 반환
    // role 필드는 없음(무시)
    // 결과: [{ period: 'YYYY-MM', scores: { score1, ..., total_score } } ...]
    const query = `
      SELECT DATE_FORMAT(evaluation_date, '%Y-%m') AS period,
             AVG(score1) AS score1,
             AVG(score2) AS score2,
             AVG(score3) AS score3,
             AVG(score4) AS score4,
             AVG(score5) AS score5,
             AVG(score6) AS score6,
             AVG(total_score) AS total_score
      FROM evaluations
      WHERE employee_id = ?
        AND evaluation_date BETWEEN ? AND ?
      GROUP BY period
      ORDER BY period ASC
    `;
    const params = [employeeId, from + '-01', to + '-31'];
    try {
      const [rows] = await this.db.execute(query, params);
      // 결과를 { period, scores: { score1, ..., total_score } } 형태로 가공
      const trend = rows.map(row => ({
        period: row.period,
        scores: {
          score1: Number(row.score1),
          score2: Number(row.score2),
          score3: Number(row.score3),
          score4: Number(row.score4),
          score5: Number(row.score5),
          score6: Number(row.score6),
          total_score: Number(row.total_score)
        }
      }));
      return trend;
    } catch (error) {
      console.error('Error fetching performance trend:', error);
      throw error;
    }
  }
  constructor() {
    this.db = mysql.createPool(config.database)
    console.log('Database pool created successfully')
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

    // 페이지네이션 (LIMIT/OFFSET은 쿼리 문자열에 직접 삽입)
    const safeLimit = Number.isInteger(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10;
    const safePage = Number.isInteger(Number(page)) && Number(page) > 0 ? Number(page) : 1;
    const offset = (safePage - 1) * safeLimit;
    query += ` ORDER BY e.id DESC LIMIT ${safeLimit} OFFSET ${offset}`;

    try {
      const [rows] = await this.db.execute(query, params)
      console.log('[EmployeeModel.findAll] 쿼리 결과 rows:', rows)
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

      // 프론트 key에 맞게 변환 (birth_date, hire_date 등)
      const employeeData = {
        id: employee.id,
        name: employee.name,
        birth_date: formatDate(employee.birth_date),
        department: employee.department,
        position: employee.position,
        hire_date: formatMonth(employee.hire_date),
        mitmas_career: employee.mitmas_career || '',
        total_career: employee.total_career || '',
        email: employee.email,
        phone: employee.phone,
        address: employee.address,
        workplace: employee.workplace,
        skills: employee.skills,
        photoUrl: employee.photo_url,
        eus_career: employee.eus_career || '',
      };

      // 학력 변환 (DB: school_name, major, period_start, period_end)
      const [educationsRaw] = await this.db.execute(
        'SELECT * FROM educations WHERE employee_id = ? ORDER BY period_start DESC',
        [id]
      )
      const educations = educationsRaw.map(e => ({
        school: e.school_name,
        major: e.major,
        degree: e.degree,
        startDate: formatMonth(e.period_start),
        endDate: formatMonth(e.period_end),
        grade: e.grade || '',
      }));

      // 경력 변환 (DB: company_name, position, period_start, period_end, task_description)
      const [careersRaw] = await this.db.execute(
        'SELECT * FROM careers WHERE employee_id = ? ORDER BY period_start DESC',
        [id]
      )
      const careers = careersRaw.map(c => ({
        company_name: c.company_name,
        position: c.position,
        startDate: formatMonth(c.period_start),
        endDate: formatMonth(c.period_end),
        responsibilities: c.task_description,
      }));

      // 자격증 변환 (DB: cert_name, cert_organization, cert_number)
      const [certificationsRaw] = await this.db.execute(
        'SELECT * FROM certifications WHERE employee_id = ? ORDER BY id DESC',
        [id]
      )
      const certifications = certificationsRaw.map(c => ({
        name: c.cert_name,
        issuer: c.cert_organization,
        certNumber: c.cert_number,
        issueDate: '', // DB에 취득일 컬럼 없음
      }));

      // 프로젝트 변환 (DB: project_name, period_start, period_end, project_description)
      const [externalProjectsRaw] = await this.db.execute(
        'SELECT * FROM external_projects WHERE employee_id = ? ORDER BY period_start DESC',
        [id]
      )
      const external_projects = externalProjectsRaw.map(p => ({
        project_name: p.project_name,
        startDate: formatMonth(p.period_start),
        endDate: formatMonth(p.period_end),
        description: p.project_description,
      }));

      // 최신 기술역량 점수 (evaluations, leader_evaluations)
      // evaluations: 최신 1건
      const [evalRows] = await this.db.execute(
        'SELECT score1, score2, score3, score4, score5, score6 FROM evaluations WHERE employee_id = ? ORDER BY evaluation_date DESC LIMIT 1',
        [id]
      );
      let skillScores = null;
      if (evalRows.length > 0) {
        skillScores = [
          evalRows[0].score1,
          evalRows[0].score2,
          evalRows[0].score3,
          evalRows[0].score4,
          evalRows[0].score5,
          evalRows[0].score6
        ].map(Number);
      } else {
        skillScores = [0, 0, 0, 0, 0, 0];
      }

      // leader_evaluations: 최신 1건
      const [leaderEvalRows] = await this.db.execute(
        'SELECT score1, score2, score3, score4, score5, score6 FROM leader_evaluations WHERE employee_id = ? ORDER BY evaluation_date DESC LIMIT 1',
        [id]
      );
      let leaderSkillScores = null;
      if (leaderEvalRows.length > 0) {
        leaderSkillScores = [
          leaderEvalRows[0].score1,
          leaderEvalRows[0].score2,
          leaderEvalRows[0].score3,
          leaderEvalRows[0].score4,
          leaderEvalRows[0].score5,
          leaderEvalRows[0].score6
        ].map(Number);
      } else {
        leaderSkillScores = [0, 0, 0, 0, 0, 0];
      }

      return {
        ...employeeData,
        educations,
        certifications,
        careers,
        external_projects,
        skillScores,
        leaderSkillScores
      }
    } catch (error) {
      console.error('Error fetching employee by ID:', error)
      throw error
    }
  }

  // 직원 생성
  async create(employeeData) {
    const connection = await this.db.getConnection()
    // 프론트 key를 DB key로 매핑 (값이 없더라도 항상 할당)
    // employeeData.birth = employeeData.birth_date ?? null; // 더 이상 필요 없음
    // employeeData.career_years = employeeData.total_career ?? null; // 더 이상 필요 없음
    employeeData.eus_career = employeeData.mitmas_career ?? null;
    // undefined를 null로 변환
    const safeData = replaceUndefinedWithNull(employeeData)
    const params = [
      safeData.name,
      safeData.department,
      safeData.position,
      safeData.email,
      safeData.phone,
      safeData.address,
      safeData.birth_date,
      safeData.photoUrl,
      safeData.eus_career,
      safeData.workplace,
      safeData.skills
    ];
    console.log('[create] employee params:', params);
    try {
      await connection.beginTransaction()

      // 직원 기본 정보 저장
      const [result] = await connection.execute(`
        INSERT INTO employees (
          name, department, position, email, phone, address, birth_date,
          photo_url, eus_career, workplace, skills
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, params)

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
    // 프론트 key를 DB key로 매핑 (값이 없더라도 항상 할당)
    // employeeData.birth = employeeData.birth_date ?? null; // 더 이상 필요 없음
    // employeeData.career_years = employeeData.total_career ?? null; // 더 이상 필요 없음
    employeeData.eus_career = employeeData.mitmas_career ?? null;
    // undefined를 null로 변환
    const safeData = replaceUndefinedWithNull(employeeData)
    const params = [
      safeData.name,
      safeData.department,
      safeData.position,
      safeData.email,
      safeData.phone,
      safeData.address,
      safeData.birth_date,
      safeData.photoUrl,
      safeData.eus_career,
      safeData.workplace,
      safeData.skills,
      id
    ];
    console.log('[update] employee params:', params);
    try {
      await connection.beginTransaction()

      // 직원 기본 정보 수정
      await connection.execute(`
        UPDATE employees SET
          name = ?, department = ?, position = ?, email = ?, phone = ?,
          address = ?, birth_date = ?, photo_url = ?,
          eus_career = ?, workplace = ?, skills = ?
        WHERE id = ?
      `, params)

      // 관련 데이터 삭제 후 재생성
      await connection.execute('DELETE FROM educations WHERE employee_id = ?', [id])
      await connection.execute('DELETE FROM certifications WHERE employee_id = ?', [id])
      await connection.execute('DELETE FROM careers WHERE employee_id = ?', [id])
      await connection.execute('DELETE FROM external_projects WHERE employee_id = ?', [id])

      // 관련 데이터 저장
      if (employeeData.educations?.length > 0) {
        await this.saveEducations(connection, id, employeeData.educations)
      }

      if (employeeData.certificates?.length > 0) {
        await this.saveCertifications(connection, id, employeeData.certificates)
      }

      if (employeeData.careers?.length > 0) {
        await this.saveCareers(connection, id, employeeData.careers)
      }

      if (employeeData.projects?.length > 0) {
        await this.saveExternalProjects(connection, id, employeeData.projects)
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
      await connection.execute('DELETE FROM certifications WHERE employee_id = ?', [id])
      await connection.execute('DELETE FROM careers WHERE employee_id = ?', [id])
      await connection.execute('DELETE FROM external_projects WHERE employee_id = ?', [id])

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
        INSERT INTO educations (employee_id, school, major, degree, period_start, period_end, grade)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [employeeId, education.school, education.major, education.degree, 
          education.periodStart, education.periodEnd, education.grade])
    }
  }

  // 자격증 저장
  async saveCertifications(connection, employeeId, certifications) {
    for (const cert of certifications) {
      const safeCert = replaceUndefinedWithNull(cert)
      await connection.execute(`
        INSERT INTO certifications (employee_id, cert_number, cert_name, cert_organization)
        VALUES (?, ?, ?, ?)
      `, [employeeId, safeCert.certNumber, safeCert.certName, safeCert.certOrganization])
    }
  }

  // 경력 저장
  async saveCareers(connection, employeeId, careers) {
    for (const career of careers) {
      await connection.execute(`
        INSERT INTO careers (employee_id, company_name, position, period_start, period_end, task_description)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [employeeId, career.companyName, career.position,
          career.periodStart, career.periodEnd, career.taskDescription])
    }
  }

  // 프로젝트 저장
  async saveExternalProjects(connection, employeeId, projects) {
    for (const project of projects) {
      const safeProject = replaceUndefinedWithNull(project)
      await connection.execute(`
        INSERT INTO external_projects (employee_id, project_name, period_start, period_end, project_description)
        VALUES (?, ?, ?, ?, ?)
      `, [employeeId, safeProject.projectName, safeProject.periodStart, safeProject.periodEnd, safeProject.description])
    }
  }
}

module.exports = EmployeeModel
