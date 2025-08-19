// backend/controllers/EvaluationController.js

// Sequelize 모델 직접 import (단일 모델 환경 지원)
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Evaluation = require('../models/Evaluation')(sequelize, DataTypes);
const EvaluationService = require('../services/EvaluationService');

class EvaluationController {
  /**
   * 리더 평가 이력 조회
   * GET /api/evaluations/leader/:id
   */
  async getLeaderEvaluationHistory(req, res) {
    const employeeId = req.params.id;
    try {
      const leaderEvaluation = await EvaluationService.getLeaderEvaluationHistory(employeeId);
      if (!leaderEvaluation) {
        return res.status(404).json({ success: false, message: '리더 평가 이력이 존재하지 않습니다.', data: null });
      }
      res.json(leaderEvaluation);
    } catch (error) {
      console.error('[getLeaderEvaluationHistory] error:', error);
      res.status(500).json({ success: false, message: '리더 평가 이력 조회 중 오류가 발생했습니다.', error: error.message });
    }
  }

  /**
   * 직원별 평가 이력 조회
   * GET /api/evaluations/:id
   */
  async getEvaluationHistory(req, res) {
    const employeeId = req.params.id;
    try {
      const evaluation = await EvaluationService.getEvaluationHistory(employeeId);
      if (!evaluation) {
        return res.status(404).json({ success: false, message: '평가 이력이 존재하지 않습니다.', data: null });
      }
      res.json(evaluation);
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
      const employeeId = req.params.id;
      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: 'employeeId가 누락되었습니다.',
          error: 'employeeId is required',
          data: null
        });
      }
      // DTO 생성 시 employee_id를 body에 추가
      const payload = { ...req.body, employee_id: employeeId };
      const result = await EvaluationService.upsertEvaluation(payload);
      res.json({ success: true, message: '평가 이력 등록/수정 완료', data: result });
    } catch (error) {
      console.error('[upsertEvaluation] error:', error);
      res.status(500).json({
        success: false,
        message: '평가 이력 등록/수정 중 오류가 발생했습니다.',
        error: error.message || error.toString(),
        data: null
      });
    }
  }

  /**
   * 리더 평가 이력 등록 또는 수정 (같은 직원+연월 데이터가 있으면 update, 없으면 insert)
   * POST /api/evaluations/leader/:id
   * body: { employeeId, year, month, score1~6, evaluated_by, special_note }
   */
  async upsertLeaderEvaluation(req, res) {
    try {
      const employeeId = req.params.id;
      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: 'employeeId가 누락되었습니다.',
          error: 'employeeId is required',
          data: null
        });
      }
      const payload = { ...req.body, employee_id: employeeId };
      const result = await EvaluationService.upsertLeaderEvaluation(payload);
      res.json({ success: true, message: '리더 평가 이력 등록/수정 완료', data: result });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '리더 평가 이력 등록/수정 중 오류가 발생했습니다.',
        error: error.message || error.toString(),
        data: null
      });
    }
  }
}

module.exports = EvaluationController;
