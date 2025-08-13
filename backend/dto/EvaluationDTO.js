// backend/dto/EvaluationDTO.js

class EvaluationDTO {
  constructor({ employeeId, year, month, score1, score2, score3, score4, score5, score6 }) {
    this.employeeId = employeeId;
    this.year = year;
    this.month = month;
    this.score1 = score1;
    this.score2 = score2;
    this.score3 = score3;
    this.score4 = score4;
    this.score5 = score5;
    this.score6 = score6;
  }
}

module.exports = EvaluationDTO;
