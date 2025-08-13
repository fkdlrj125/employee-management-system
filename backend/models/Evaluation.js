// backend/models/Evaluation.js
// Sequelize 기반 평가 이력 모델 예시
// config/sequelize.js에서 sequelize 인스턴스 import

module.exports = (sequelize, DataTypes) => {
  const Evaluation = sequelize.define('Evaluation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'employee_id',
    },
    total_score: { type: DataTypes.INTEGER },
    evaluated_by: { type: DataTypes.INTEGER },
    special_note: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    evaluation_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'evaluation_date',
    },
    score1: { type: DataTypes.FLOAT, allowNull: false, field: 'score1' },
    score2: { type: DataTypes.FLOAT, allowNull: false, field: 'score2' },
    score3: { type: DataTypes.FLOAT, allowNull: false, field: 'score3' },
    score4: { type: DataTypes.FLOAT, allowNull: false, field: 'score4' },
    score5: { type: DataTypes.FLOAT, allowNull: false, field: 'score5' },
    score6: { type: DataTypes.FLOAT, allowNull: false, field: 'score6' },
    // 필요시 추가 필드
  }, {
    tableName: 'evaluations',
    timestamps: false,
  });

  // 관계 설정 (직원 1:N 평가)
  Evaluation.associate = function(models) {
    Evaluation.belongsTo(models.Employee, { foreignKey: 'employeeId', as: 'employee' });
  };

  return Evaluation;
};
