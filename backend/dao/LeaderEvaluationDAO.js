// backend/dao/LeaderEvaluationDAO.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const LeaderEvaluation = require('../models/LeaderEvaluation')(sequelize, DataTypes);

class LeaderEvaluationDAO {
  // 직원별 최신 리더 평가 이력 조회
  async findLatestByEmployee(employee_id) {
    if (!employee_id) throw new Error('employee_id 값이 필요합니다.');
    return LeaderEvaluation.findOne({
      where: { employee_id },
      order: [['evaluation_date', 'DESC']],
    });
  }
  // 리더 평가 이력 수정
  async update(evaluation, data) {
    const updateData = { ...data };
    if (data.special_note !== undefined) updateData.special_note = data.special_note;
    if (data.evaluated_by !== undefined) updateData.evaluated_by = data.evaluated_by;
    return evaluation.update(updateData);
  }

  // 리더 평가 이력 생성
  async create(data) {
    const createData = { ...data };
    if (data.special_note !== undefined) createData.special_note = data.special_note;
    if (data.evaluated_by !== undefined) createData.evaluated_by = data.evaluated_by;
    return LeaderEvaluation.create(createData);
  }
  // 직원+연월로 리더 평가 이력 조회
  async findByEmployeeAndMonth(employee_id, year, month) {
    const evaluation_date = `${year}-${String(month).padStart(2, '0')}-01`;
    return LeaderEvaluation.findOne({ where: { employee_id, evaluation_date } });
  }

  // 직원별 전체 리더 평가 이력 조회
  async findAllByEmployee(employee_id) {
    return LeaderEvaluation.findAll({
      where: { employee_id },
      order: [['evaluation_date', 'ASC']],
    });
  }

  // 리더 평가 이력 upsert(있으면 update, 없으면 insert)
  async upsert(dto) {
    const { employee_id, year, month } = dto;
    const evaluation_date = `${year}-${String(month).padStart(2, '0')}-01`;
    let evaluation = await this.findByEmployeeAndMonth(employee_id, year, month);
    if (evaluation) {
      return this.update(evaluation, dto);
    } else {
      return this.create({ ...dto, evaluation_date });
    }
  }
}

module.exports = new LeaderEvaluationDAO();
