// backend/services/EvaluationService.js
const EvaluationDAO = require('../dao/EvaluationDAO');
const EvaluationDTO = require('../dto/EvaluationDTO');

class EvaluationService {
  // 직원별 평가 이력 전체 조회
  async getEvaluationHistory(employeeId) {
    return EvaluationDAO.findAllByEmployee(employeeId);
  }

  // 평가 이력 등록/수정(연월 중복 시 update)
  async upsertEvaluation(data) {
    const dto = new EvaluationDTO(data);
    return EvaluationDAO.upsert(dto);
  }
}

module.exports = new EvaluationService();
