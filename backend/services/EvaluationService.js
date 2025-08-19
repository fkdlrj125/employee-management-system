// backend/services/EvaluationService.js
const EvaluationDAO = require('../dao/EvaluationDAO');
const EvaluationDTO = require('../dto/EvaluationDTO');
const LeaderEvaluationDAO = require('../dao/LeaderEvaluationDAO');
const LeaderEvaluationDTO = require('../dto/LeaderEvaluationDTO');

class EvaluationService {
  // 리더 최신 평가 이력 조회
  async getLeaderEvaluationHistory(employeeId) {
    return LeaderEvaluationDAO.findLatestByEmployee(employeeId);
  }

  // 직원별 최신 평가 이력 조회
  async getEvaluationHistory(employeeId) {
    return EvaluationDAO.findLatestByEmployee(employeeId);
  }

  // 평가 이력 등록/수정(연월 중복 시 update)
  async upsertEvaluation(data) {
    const dto = new EvaluationDTO(data);
    return EvaluationDAO.upsert(dto);
  }

  // 리더 평가 이력 등록/수정(연월 중복 시 update)
  async upsertLeaderEvaluation(data) {
    const dto = new LeaderEvaluationDTO(data);
    return LeaderEvaluationDAO.upsert(dto);
  }
}

module.exports = new EvaluationService();
