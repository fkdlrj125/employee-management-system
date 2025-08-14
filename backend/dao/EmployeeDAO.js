// backend/dao/EmployeeDAO.js
const { Sequelize, DataTypes, Op } = require('sequelize');
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
        { model: Education, as: 'educations' },
        { model: Career, as: 'careers' },
        { model: Certification, as: 'certifications' },
        { model: ExternalProject, as: 'external_projects' }
      ]
    });
  }

  // 직원 생성
  async create(employeeData) {
    return sequelize.transaction(async (t) => {
      const { educations, careers, certifications, external_projects, ...emp } = employeeData;
      const employee = await Employee.create(emp, { transaction: t });
      if (educations?.length) {
        for (const edu of educations) {
          const sanitizeDate = v => (!v || v === 'Invalid date') ? null : v;
          const params = {
            school_name: edu.school_name || edu.school || '',
            major: edu.major || '',
            period_start: sanitizeDate(edu.period_start || edu.periodStart),
            period_end: sanitizeDate(edu.period_end || edu.periodEnd),
            employee_id: employee.id
          };
          console.log('[DAO][CREATE] education params:', params);
          await Education.create(params, { transaction: t });
        }
      }
      if (careers?.length) {
        for (const c of careers) {
          const sanitizeDate = v => (!v || v === 'Invalid date') ? null : v;
          console.log('[DAO][CREATE] career:', c);
          await Career.create({
            ...c,
            period_start: sanitizeDate(c.period_start || c.periodStart),
            period_end: sanitizeDate(c.period_end || c.periodEnd),
            employee_id: employee.id
          }, { transaction: t });
        }
      }
      if (certifications?.length) {
        for (const cert of certifications) {
          console.log('[DAO][CREATE] certification:', cert);
          await Certification.create({
            ...cert,
            employee_id: employee.id
          }, { transaction: t });
        }
      }
      if (external_projects?.length) {
        for (const p of external_projects) {
          const sanitizeDate = v => (!v || v === 'Invalid date') ? null : v;
          console.log('[DAO][CREATE] external_project:', p);
          await ExternalProject.create({
            ...p,
            period_start: sanitizeDate(p.period_start || p.periodStart),
            period_end: sanitizeDate(p.period_end || p.periodEnd),
            employee_id: employee.id
          }, { transaction: t });
        }
      }
      return this.findById(employee.id);
    });
  }

  // 직원 수정
  async update(id, employeeData) {
    return sequelize.transaction(async (t) => {
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
          const sanitizeDate = v => (!v || v === 'Invalid date') ? null : v;
          const params = {
            school_name: edu.school_name || edu.school || '',
            major: edu.major || '',
            period_start: sanitizeDate(edu.period_start || edu.periodStart),
            period_end: sanitizeDate(edu.period_end || edu.periodEnd),
            employee_id: id
          };
          console.log('[DAO][UPDATE] education params:', params);
          await Education.create(params, { transaction: t });
        }
      }
      if (careers?.length) {
        for (const c of careers) {
          const sanitizeDate = v => (!v || v === 'Invalid date') ? null : v;
          console.log('[DAO][UPDATE] career:', c);
          await Career.create({
            ...c,
            period_start: sanitizeDate(c.period_start || c.periodStart),
            period_end: sanitizeDate(c.period_end || c.periodEnd),
            employee_id: id
          }, { transaction: t });
        }
      }
      if (certifications?.length) {
        for (const cert of certifications) {
          console.log('[DAO][UPDATE] certification:', cert);
          await Certification.create({
            ...cert,
            employee_id: id
          }, { transaction: t });
        }
      }
      if (external_projects?.length) {
        for (const p of external_projects) {
          const sanitizeDate = v => (!v || v === 'Invalid date') ? null : v;
          console.log('[DAO][UPDATE] external_project:', p);
          await ExternalProject.create({
            ...p,
            period_start: sanitizeDate(p.period_start || p.periodStart),
            period_end: sanitizeDate(p.period_end || p.periodEnd),
            employee_id: id
          }, { transaction: t });
        }
      }
      return this.findById(id);
    });
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
