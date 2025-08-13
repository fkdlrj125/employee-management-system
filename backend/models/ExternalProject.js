// backend/models/ExternalProject.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ExternalProject = sequelize.define('ExternalProject', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    employee_id: { type: DataTypes.INTEGER, allowNull: false },
    project_name: { type: DataTypes.STRING },
    period_start: { type: DataTypes.DATEONLY },
    period_end: { type: DataTypes.DATEONLY },
    project_description: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'external_projects',
    timestamps: false,
  });
  return ExternalProject;
};
