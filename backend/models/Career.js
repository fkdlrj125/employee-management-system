// backend/models/Career.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Career = sequelize.define('Career', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    employee_id: { type: DataTypes.INTEGER, allowNull: false },
    company_name: { type: DataTypes.STRING },
    position: { type: DataTypes.STRING },
    period_start: { type: DataTypes.DATEONLY },
    period_end: { type: DataTypes.DATEONLY },
    task_description: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'careers',
    timestamps: false,
  });
  return Career;
};
