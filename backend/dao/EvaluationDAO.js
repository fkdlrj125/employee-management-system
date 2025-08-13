// backend/dao/EvaluationDAO.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Evaluation = require('../models/Evaluation')(sequelize, DataTypes);

class EvaluationDAO {
  // 직원+연월로 평가 이력 조회
  async findByEmployeeAndMonth(employeeId, year, month) {
    const evaluation_date = `${year}-${String(month).padStart(2, '0')}-01`;
    return Evaluation.findOne({ where: { employeeId, evaluation_date } });
  }

  // 직원별 전체 평가 이력 조회
  async findAllByEmployee(employeeId) {
    return Evaluation.findAll({
      where: { employeeId },
      order: [['evaluation_date', 'ASC']],
    });
  }

  // 평가 이력 생성
  async create(evaluationDTO) {
    return Evaluation.create(evaluationDTO);
  }

  // 평가 이력 수정
  async update(evaluation, updateDTO) {
    Object.assign(evaluation, updateDTO);
    return evaluation.save();
  }

  // 평가 이력 upsert(있으면 update, 없으면 insert)
  async upsert(evaluationDTO) {
    const { employeeId, year, month } = evaluationDTO;
    const evaluation_date = `${year}-${String(month).padStart(2, '0')}-01`;
    let evaluation = await this.findByEmployeeAndMonth(employeeId, year, month);
    if (evaluation) {
      return this.update(evaluation, evaluationDTO);
    } else {
      return this.create({ ...evaluationDTO, evaluation_date });
    }
  }
}

module.exports = new EvaluationDAO();
