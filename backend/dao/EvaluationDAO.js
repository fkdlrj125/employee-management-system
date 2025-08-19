// backend/dao/EvaluationDAO.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Evaluation = require('../models/Evaluation')(sequelize, DataTypes);

class EvaluationDAO {
  // 직원별 최신 평가 이력 조회
  async findLatestByEmployee(employee_id) {
    if (!employee_id) throw new Error('employee_id 값이 필요합니다.');
    return Evaluation.findOne({
      where: { employee_id },
      order: [['evaluation_date', 'DESC']],
    });
  }
  // 평가 이력 수정
  async update(evaluation, data) {
    // special_note, evaluated_by도 포함
    const updateData = { ...data };
    if (data.special_note !== undefined) updateData.special_note = data.special_note;
    if (data.evaluated_by !== undefined) updateData.evaluated_by = data.evaluated_by;
    return evaluation.update(updateData);
  }

  // 평가 이력 생성
  async create(data) {
    // special_note, evaluated_by도 포함
    const createData = { ...data };
    if (data.special_note !== undefined) createData.special_note = data.special_note;
    if (data.evaluated_by !== undefined) createData.evaluated_by = data.evaluated_by;
    return Evaluation.create(createData);
  }

  // 직원+평가일로 평가 이력 조회
  async findByEmployeeAndDate(employee_id, evaluation_date) {
    if (!employee_id || !evaluation_date) {
      throw new Error('employee_id, evaluation_date 값이 모두 필요합니다.');
    }
    return Evaluation.findOne({ where: { employee_id, evaluation_date } });
  }

  // 직원별 전체 평가 이력 조회
  async findAllByEmployee(employee_id) {
    if (!employee_id) throw new Error('employee_id 값이 필요합니다.');
    return Evaluation.findAll({
      where: { employee_id },
      order: [['evaluation_date', 'ASC']],
    });
  }

  // 평가 이력 upsert(있으면 update, 없으면 insert)
  async upsert(evaluationDTO) {
    const { employee_id, evaluation_date } = evaluationDTO;
    if (!employee_id || !evaluation_date) {
      throw new Error('employee_id, evaluation_date 값이 모두 필요합니다.');
    }
    let evaluation = await this.findByEmployeeAndDate(employee_id, evaluation_date);
    if (evaluation) {
      return this.update(evaluation, evaluationDTO);
    } else {
      return this.create({ ...evaluationDTO });
    }
  }
}

module.exports = new EvaluationDAO();
