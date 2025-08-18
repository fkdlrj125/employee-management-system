// backend/models/LeaderEvaluation.js
module.exports = (sequelize, DataTypes) => {
  const LeaderEvaluation = sequelize.define('LeaderEvaluation', {
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
    score1: { type: DataTypes.INTEGER, allowNull: false },
    score2: { type: DataTypes.INTEGER, allowNull: false },
    score3: { type: DataTypes.INTEGER, allowNull: false },
    score4: { type: DataTypes.INTEGER, allowNull: false },
    score5: { type: DataTypes.INTEGER, allowNull: false },
    score6: { type: DataTypes.INTEGER, allowNull: false },
    total_score: { type: DataTypes.INTEGER },
    evaluated_by: { type: DataTypes.INTEGER },
    evaluation_date: { type: DataTypes.DATEONLY, allowNull: false },
    special_note: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'leader_evaluations',
    timestamps: false,
  });
  return LeaderEvaluation;
};
