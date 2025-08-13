// ...existing code...
// backend/models/Certification.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Certification = sequelize.define('Certification', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    employee_id: { type: DataTypes.INTEGER, allowNull: false },
    cert_number: { type: DataTypes.STRING },
    cert_name: { type: DataTypes.STRING },
    cert_organization: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'certifications',
    timestamps: false,
  });
  return Certification;
};
