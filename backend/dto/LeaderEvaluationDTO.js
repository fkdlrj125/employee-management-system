// backend/dto/LeaderEvaluationDTO.js
class LeaderEvaluationDTO {
  constructor({ employee_id, evaluation_date, leaderSkillScores, evaluated_by, special_note }) {
    console.log('[LeaderEvaluationDTO] employee_id:', employee_id);
    this.employee_id = employee_id;
    this.evaluation_date = evaluation_date;
    const scores = leaderSkillScores || [];
    this.score1 = scores[0] ?? 0;
    this.score2 = scores[1] ?? 0;
    this.score3 = scores[2] ?? 0;
    this.score4 = scores[3] ?? 0;
    this.score5 = scores[4] ?? 0;
    this.score6 = scores[5] ?? 0;
    if (special_note !== undefined) this.special_note = special_note;
    if (evaluated_by !== undefined) this.evaluated_by = evaluated_by;
  }
}

module.exports = LeaderEvaluationDTO;
