// backend/dao/EmployeeDAO.js
const { Sequelize, DataTypes, Op } = require('sequelize');
const moment = require('moment');
const sequelize = require('../config/sequelize');
const Employee = require('../models/Employee')(sequelize);
const Education = require('../models/Education')(sequelize);
const Career = require('../models/Career')(sequelize);
const Certification = require('../models/Certification')(sequelize);
const ExternalProject = require('../models/ExternalProject')(sequelize);
const Evaluation = require('../models/Evaluation')(sequelize, DataTypes);
const LeaderEvaluation = require('../models/LeaderEvaluation')(sequelize, DataTypes);

class EmployeeDAO {
  // 직원 목록 조회 (필터/검색/페이지네이션)
  async findAll(options = {}) {
    const { page = 1, limit = 10, department = '', position = '', search = '', sortBy = 'position', sortOrder = 'desc' } = options;
    const where = {};
    if (department) where.department = department;
    if (position) where.position = position;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    const offset = (page - 1) * limit;
    // 동적 ORDER BY 생성
    let order;
    if (sortBy === 'position') {
      const positionOrderCase = `CASE position
        WHEN '사원' THEN 1
        WHEN '주임' THEN 2
        WHEN '대리' THEN 3
        WHEN '과장' THEN 4
        WHEN '차장' THEN 5
        WHEN '부장' THEN 6
        WHEN '실장' THEN 7
        WHEN '이사' THEN 8
        WHEN '부사장' THEN 9
        WHEN '사장' THEN 10
        ELSE 99 END`;
      order = [
        [sequelize.literal(positionOrderCase), sortOrder.toUpperCase()],
        [sequelize.literal('TIMESTAMPDIFF(MONTH, hire_date, NOW())'), 'DESC']
      ];
    } else if (sortBy === 'mitmas_total_career') {
      const positionOrderCase = `CASE position
        WHEN '사원' THEN 1
        WHEN '주임' THEN 2
        WHEN '대리' THEN 3
        WHEN '과장' THEN 4
        WHEN '차장' THEN 5
        WHEN '부장' THEN 6
        WHEN '실장' THEN 7
        WHEN '이사' THEN 8
        WHEN '부사장' THEN 9
        WHEN '사장' THEN 10
        ELSE 99 END`;
      order = [
        [sequelize.literal('TIMESTAMPDIFF(MONTH, hire_date, NOW())'), sortOrder.toUpperCase()],
        [sequelize.literal(positionOrderCase), 'DESC']
      ];
    } else if (sortBy === 'total_score') {
      // 직원별 최신 멤버/리더 평가 점수 평균으로 정렬 (서브쿼리)
      order = [
        [sequelize.literal(`((
          IFNULL((SELECT e.total_score FROM evaluations e WHERE e.employee_id = Employee.id ORDER BY e.evaluation_date DESC LIMIT 1), 0)
          + IFNULL((SELECT l.total_score FROM leader_evaluations l WHERE l.employee_id = Employee.id ORDER BY l.evaluation_date DESC LIMIT 1), 0)
        ) / 2)`), sortOrder.toUpperCase()]
      ];
    } else {
      // 기타 컬럼 정렬
      order = [[sortBy, sortOrder.toUpperCase()]];
    }
    const { rows, count } = await Employee.findAndCountAll({
      where,
      limit,
      offset,
      order
    });
    // 직원별 평가점수 추가
    const employeesWithScores = await Promise.all(rows.map(async (emp) => {
      // 멤버 평가점수
      const memberEval = await Evaluation.findOne({
        where: { employee_id: emp.id },
        order: [['evaluation_date', 'DESC']]
      });
      // 리더 평가점수
      const leaderEval = await LeaderEvaluation.findOne({
        where: { employee_id: emp.id },
        order: [['evaluation_date', 'DESC']]
      });
      // plain object로 변환
      const plainEmp = emp.get ? emp.get({ plain: true }) : emp;
      plainEmp.member_total_score = memberEval ? memberEval.total_score : null;
      plainEmp.leader_total_score = leaderEval ? leaderEval.total_score : null;
      return plainEmp;
    }));
    return {
      employees: employeesWithScores,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    };
  }

  // 직원 상세 조회
  async findById(id, transaction = null) {
    return Employee.findByPk(id, {
      include: [
        { model: Education, as: 'educations', required: false },
        { model: Career, as: 'careers', required: false },
        { model: Certification, as: 'certifications', required: false },
        { model: ExternalProject, as: 'external_projects', required: false }
      ],
      transaction
    });
  }

  // 직원 목록에서 부서 목록 조회
  async findAllDepartments() {
    const departments = await Employee.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('department')), 'department']
      ],
      raw: true
    });
    return departments.map(d => d.department);
  }

  async findAllPositions() {
    const positions = await Employee.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('position')), 'position']
      ],
      raw: true
    });
    return positions.map(p => p.position);
  }

  // 직원 생성
  async create(employeeData) {
    try {
      return await sequelize.transaction(async (t) => {
        const { educations, careers, certifications, external_projects, ...emp } = employeeData;
        const employee = await Employee.create(emp, { transaction: t });

        if (!employee || !employee.id) {
          const missingFields = [];
          if (!emp.name) missingFields.push('name');
          if (!emp.department) missingFields.push('department');
          if (!emp.position) missingFields.push('position');
          // 필요한 필드 추가 가능
          const err = new Error('직원 생성에 실패했습니다. 필수값 누락 또는 DB 제약조건 오류');
          err.code = 'NO_EMPLOYEE_ID';
          err.missingFields = missingFields;
          err.inputData = emp;
          throw err;
        }

        if (educations?.length) {
          for (const edu of educations) {
            if (!edu.school_name) continue;
            const { id, ...eduData } = edu;
            await Education.create({
              ...eduData,
              employee_id: employee.id
            }, { transaction: t });
          }
        }

        if (careers?.length) {
          for (const c of careers) {
            if (!c.company_name) continue;
            const { id, ...careerData } = c;
            await Career.create({
              ...careerData,
              employee_id: employee.id
            }, { transaction: t });
          }
        }

        if (certifications?.length) {
          for (const cert of certifications) {
            const { id, ...certData } = cert;
            await Certification.create({
              ...certData,
              employee_id: employee.id
            }, { transaction: t });
          }
        }

        if (external_projects?.length) {
          for (const p of external_projects) {
            const { id, ...projectData } = p;
            await ExternalProject.create({
              ...projectData,
              employee_id: employee.id
            }, { transaction: t });
          }
        }
        const result = await this.findById(employee.id, t);
        return result;
      });
    } catch (err) {
      throw err;
    }
  }

  // 직원 수정
  async update(id, employeeData) {
    try {
      return await sequelize.transaction(async (t) => {
        const { educations, careers, certifications, external_projects, ...emp } = employeeData;
        const employee = await Employee.findByPk(id, { transaction: t });
        if (!employee) return null;
        await employee.update(emp, { transaction: t });
        // 기존 관련 데이터 삭제 후 재생성
        await Education.destroy({ where: { employee_id: id }, transaction: t });
        await Career.destroy({ where: { employee_id: id }, transaction: t });
        await Certification.destroy({ where: { employee_id: id }, transaction: t });
        await ExternalProject.destroy({ where: { employee_id: id }, transaction: t });


        if (educations?.length) {
          for (const edu of educations) {
            if (!edu.school_name) continue;
            const { id, ...eduData } = edu;
            console.log('[DAO][CREATE] education params:', eduData);
            await Education.create({
              ...eduData,
              employee_id: employee.id
            }, { transaction: t });
          }
        }

        if (careers?.length) {
          for (const c of careers) {
            if (!c.company_name) continue;
            const { id, ...careerData } = c;
            console.log('[DAO][CREATE] career:', careerData);
            await Career.create({
              ...careerData,
              employee_id: employee.id
            }, { transaction: t });
          }
        }

        if (certifications?.length) {
          for (const cert of certifications) {
            const { id, ...certData } = cert;
            console.log('[DAO][CREATE] certification:', certData);
            await Certification.create({
              ...certData,
              employee_id: employee.id
            }, { transaction: t });
          }
        }

        if (external_projects?.length) {
          for (const p of external_projects) {
            const { id, ...projectData } = p;
            console.log('[DAO][CREATE] external_project:', projectData);
            await ExternalProject.create({
              ...projectData,
              employee_id: employee.id
            }, { transaction: t });
          }
        }
        return this.findById(id);
      });
    } catch (err) {
      console.error('[DAO][UPDATE][SQL ERROR]', err?.original?.sqlMessage || err?.message, err);
      throw err;
    }
  }

  // 직원 삭제
  async delete(id) {
    const employee = await Employee.findByPk(id);
    if (!employee) return false;
    await employee.destroy();
    return true;
  }
}

module.exports = new EmployeeDAO();
