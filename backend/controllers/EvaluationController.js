// backend/controllers/EvaluationController.js

// Sequelize 모델 직접 import (단일 모델 환경 지원)
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Evaluation = require('../models/Evaluation')(sequelize, DataTypes);
const EvaluationService = require('../services/EvaluationService');

class EvaluationController {
  /**
   * 직원별 평가 이력 조회
   * GET /api/evaluations/:id
   */
  async getEvaluationHistory(req, res) {
    const employeeId = req.params.id;
    try {
      const evaluations = await EvaluationService.getEvaluationHistory(employeeId);
      if (!evaluations || evaluations.length === 0) {
        return res.status(404).json({ success: false, message: '평가 이력이 존재하지 않습니다.', data: [] });
      }
      res.json(evaluations);
    } catch (error) {
      console.error('[getEvaluationHistory] error:', error);
      res.status(500).json({ success: false, message: '평가 이력 조회 중 오류가 발생했습니다.', error: error.message });
    }
  }

  /**
   * 평가 이력 등록 또는 수정 (같은 직원+연월 데이터가 있으면 update, 없으면 insert)
   * POST /api/evaluations
   * body: { employeeId, year, month, score1~6 }
   */
  async upsertEvaluation(req, res) {
    try {
      const result = await EvaluationService.upsertEvaluation(req.body);
      res.json({ success: true, message: '평가 이력 등록/수정 완료', data: result });
    } catch (error) {
      console.error('[upsertEvaluation] error:', error);
      res.status(500).json({ success: false, message: '평가 이력 등록/수정 중 오류가 발생했습니다.', error: error.message });
    }
  }
}

module.exports = EvaluationController;
