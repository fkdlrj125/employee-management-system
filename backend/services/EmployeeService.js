const EmployeeModel = require('../models/Employee');
// 데이터 전처리 헬퍼 함수들
const moment = require('moment');
const validDepartments = ['DSS1', 'DSS2', 'CSC', 'HR'];
const validPositions = ['사원', '대리', '과장', '차장', '부장', '실장', '본부장', '이사','부사장', '사장'];

function sanitize(obj) {
  const out = {};
  for (const k in obj) {
    out[k] = (obj[k] === '') ? null : obj[k];
  }
  return out;
}

function sanitizeDate(v) {
  if (!v || v === 'Invalid date') return null;
  if (typeof v === 'string' && v.length === 7 && /^\d{4}-\d{2}$/.test(v)) return v + '-01';
  const m = moment(v, [moment.ISO_8601, 'YYYY-MM-DD', 'YYYY/MM/DD', 'YYYY.MM.DD'], true);
  return m.isValid() ? m.format('YYYY-MM-DD') : null;
}

function sanitizeArray(arr, dateFields=[]) {
  return Array.isArray(arr) ? arr.map(item => {
    const sanitized = sanitize(item);
    dateFields.forEach(f => { if (sanitized[f]) sanitized[f] = sanitizeDate(sanitized[f]); });
    return sanitized;
  }) : [];
}

function validateEmployee(emp) {
  if (emp.department && !validDepartments.includes(emp.department)) {
    const err = new Error('잘못된 부서(department) 값: ' + emp.department);
    err.code = 'INVALID_DEPARTMENT';
    err.inputData = emp;
    throw err;
  }
  if (emp.position && !validPositions.includes(emp.position)) {
    const err = new Error('잘못된 직급(position) 값: ' + emp.position);
    err.code = 'INVALID_POSITION';
    err.inputData = emp;
    throw err;
  }
}
// backend/services/EmployeeService.js
const EmployeeDAO = require('../dao/EmployeeDAO');
const EmployeeDTO = require('../dto/EmployeeDTO');

class EmployeeService {
  async getEmployees(options) {
    const result = await EmployeeDAO.findAll(options);
    // DTO 변환(배열)
    return {
      ...result,
      employees: result.employees.map(e => new EmployeeDTO(e))
    };
  }

  async getEmployeeById(id) {
    const data = await EmployeeDAO.findById(id);
    return data ? new EmployeeDTO(data) : null;
  }

  async createEmployee(data) {
    console.log('[SERVICE][CREATE] 요청 데이터:', JSON.stringify(data));
    // 분리된 하위 데이터 제외
    const { educations, careers, certifications, external_projects, ...empRaw } = data;
    // Employee 모델 필드만 추출
    const sequelize = require('../config/sequelize');
    const Employee = EmployeeModel(sequelize);
    const modelFields = Object.keys(Employee.rawAttributes);
    let empSanitized = sanitize(empRaw);
    if (empSanitized.hire_date) empSanitized.hire_date = sanitizeDate(empSanitized.hire_date);
    if (empSanitized.birth_date) empSanitized.birth_date = sanitizeDate(empSanitized.birth_date);
    // 모델 필드만 남기기
    const emp = {};
    for (const k of modelFields) {
      if (k in empSanitized) emp[k] = empSanitized[k];
    }
    validateEmployee(emp);
    const educationsSanitized = sanitizeArray(educations, ['period_start', 'period_end']);
    const careersSanitized = sanitizeArray(careers, ['period_start', 'period_end']);
    const certificationsSanitized = sanitizeArray(certifications);
    const externalProjectsSanitized = sanitizeArray(external_projects, ['period_start', 'period_end']);
    try {
      const created = await EmployeeDAO.create({
        ...emp,
        educations: educationsSanitized,
        careers: careersSanitized,
        certifications: certificationsSanitized,
        external_projects: externalProjectsSanitized
      });
      if (!created) {
        const err = new Error('직원 생성에 실패했습니다. 반환값이 null입니다.');
        err.code = 'NULL_EMPLOYEE_OBJECT';
        err.inputData = emp;
        throw err;
      }
      return new EmployeeDTO(created);
    } catch (err) {
      console.error('[SERVICE][CREATE][SQL ERROR]', err?.original?.sqlMessage || err?.message, err);
      throw err;
    }
  }

  async updateEmployee(id, data) {
    console.log('[SERVICE][UPDATE] id:', id, 'employeeData:', JSON.stringify(data));
    const { educations, careers, certifications, external_projects, ...empRaw } = data;
    const emp = sanitize(empRaw);
    if (emp.hire_date) emp.hire_date = sanitizeDate(emp.hire_date);
    if (emp.birth_date) emp.birth_date = sanitizeDate(emp.birth_date);
    validateEmployee(emp);
    const educationsSanitized = sanitizeArray(educations, ['period_start', 'period_end']);
    const careersSanitized = sanitizeArray(careers, ['period_start', 'period_end']);
    const certificationsSanitized = sanitizeArray(certifications);
    const externalProjectsSanitized = sanitizeArray(external_projects, ['period_start', 'period_end']);
    try {
      const updated = await EmployeeDAO.update(id, {
        ...emp,
        educations: educationsSanitized,
        careers: careersSanitized,
        certifications: certificationsSanitized,
        external_projects: externalProjectsSanitized
      });
      return new EmployeeDTO(updated);
    } catch (err) {
      console.error('[SERVICE][UPDATE][SQL ERROR]', err?.original?.sqlMessage || err?.message, err);
      throw err;
    }
  }

  async deleteEmployee(id) {
    return EmployeeDAO.delete(id);
  }
}

module.exports = new EmployeeService();
