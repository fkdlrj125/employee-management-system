// backend/dao/EmployeeDAO.js
const { Sequelize, DataTypes, Op } = require('sequelize');
const moment = require('moment');
const sequelize = require('../config/sequelize');
const Employee = require('../models/Employee')(sequelize);
const Education = require('../models/Education')(sequelize);
const Career = require('../models/Career')(sequelize);
const Certification = require('../models/Certification')(sequelize);
const ExternalProject = require('../models/ExternalProject')(sequelize);

class EmployeeDAO {
  // 직원 목록 조회 (필터/검색/페이지네이션)
  async findAll(options = {}) {
    const { page = 1, limit = 10, department = '', position = '', search = '' } = options;
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
    const { rows, count } = await Employee.findAndCountAll({
      where,
      limit,
      offset,
      order: [['id', 'DESC']]
    });
    return {
      employees: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    };
  }

  // 직원 상세 조회
  async findById(id) {
    return Employee.findByPk(id, {
      include: [
        { model: Education, as: 'educations', required: false },
        { model: Career, as: 'careers', required: false },
        { model: Certification, as: 'certifications', required: false },
        { model: ExternalProject, as: 'external_projects', required: false }
      ]
    });
  }

  // 직원 생성
  async create(employeeData) {
    try {
      console.log('[DAO][CREATE] 트랜잭션 시작');
      return await sequelize.transaction(async (t) => {
        const { educations, careers, certifications, external_projects, ...emp } = employeeData;
        console.log('[DAO][CREATE] insert 시도 데이터(emp):', emp);
        const employee = await Employee.create(emp, { transaction: t, logging: console.log });
        console.log('[DAO][CREATE] Employee.create 반환값:', employee);
        console.log('[DAO][CREATE] employee.id:', employee?.id);

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
            console.log('[DAO][CREATE] education insert 시도:', eduData);
            await Education.create({
              ...eduData,
              employee_id: employee.id
            }, { transaction: t, logging: console.log });
          }
        }

        if (careers?.length) {
          for (const c of careers) {
            if (!c.company_name) continue;
            const { id, ...careerData } = c;
            console.log('[DAO][CREATE] career insert 시도:', careerData);
            await Career.create({
              ...careerData,
              employee_id: employee.id
            }, { transaction: t, logging: console.log });
          }
        }

        if (certifications?.length) {
          for (const cert of certifications) {
            const { id, ...certData } = cert;
            console.log('[DAO][CREATE] certification insert 시도:', certData);
            await Certification.create({
              ...certData,
              employee_id: employee.id
            }, { transaction: t, logging: console.log });
          }
        }

        if (external_projects?.length) {
          for (const p of external_projects) {
            const { id, ...projectData } = p;
            console.log('[DAO][CREATE] external_project insert 시도:', projectData);
            await ExternalProject.create({
              ...projectData,
              employee_id: employee.id
            }, { transaction: t, logging: console.log });
          }
        }
        const result = await this.findById(employee.id);
        console.log('[DAO][CREATE] findById 결과:', result);
        console.log('[DAO][CREATE] 트랜잭션 종료');
        return result;
      });
    } catch (err) {
      console.error('[DAO][CREATE][SQL ERROR] 전체 에러 객체:', err);
      console.error('[DAO][CREATE][SQL ERROR] sqlMessage:', err?.original?.sqlMessage);
      console.error('[DAO][CREATE][SQL ERROR] message:', err?.message);
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
        await employee.update(emp, { transaction: t, logging: console.log });
        // 기존 관련 데이터 삭제 후 재생성
        await Education.destroy({ where: { employee_id: id }, transaction: t, logging: console.log });
        await Career.destroy({ where: { employee_id: id }, transaction: t, logging: console.log });
        await Certification.destroy({ where: { employee_id: id }, transaction: t, logging: console.log });
        await ExternalProject.destroy({ where: { employee_id: id }, transaction: t, logging: console.log });


        if (educations?.length) {
          for (const edu of educations) {
            if (!edu.school_name) continue;
            const { id, ...eduData } = edu;
            console.log('[DAO][CREATE] education params:', eduData);
            await Education.create({
              ...eduData,
              employee_id: employee.id
            }, { transaction: t, logging: console.log });
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
            }, { transaction: t, logging: console.log });
          }
        }

        if (certifications?.length) {
          for (const cert of certifications) {
            const { id, ...certData } = cert;
            console.log('[DAO][CREATE] certification:', certData);
            await Certification.create({
              ...certData,
              employee_id: employee.id
            }, { transaction: t, logging: console.log });
          }
        }

        if (external_projects?.length) {
          for (const p of external_projects) {
            const { id, ...projectData } = p;
            console.log('[DAO][CREATE] external_project:', projectData);
            await ExternalProject.create({
              ...projectData,
              employee_id: employee.id
            }, { transaction: t, logging: console.log });
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
