// backend/models/Education.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Education = sequelize.define('Education', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    employee_id: { type: DataTypes.INTEGER, allowNull: false },
    school_name: { type: DataTypes.STRING },
    major: { type: DataTypes.STRING },
    // degree: { type: DataTypes.STRING }, // Commented out for removal
    period_start: { type: DataTypes.DATEONLY, allowNull: true },
    period_end: { type: DataTypes.DATEONLY, allowNull: true },
    // grade: { type: DataTypes.STRING }, // DB에 없음
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'educations',
    timestamps: false,
  });
  return Education;
};
