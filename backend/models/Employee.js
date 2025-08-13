// backend/models/Employee.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Employee = sequelize.define('Employee', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    department: { type: DataTypes.ENUM('DSS1', 'DSS2', 'CSC', 'HR') },
    position: { type: DataTypes.ENUM('사원', '대리', '과장', '차장', '부장', '실장', '본부장', '이사','부사장', '사장') },
    email: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    address: { type: DataTypes.TEXT },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    birth_date: { type: DataTypes.DATEONLY },
    hire_date: { type: DataTypes.DATEONLY },
    photo_url: { type: DataTypes.STRING, defaultValue: 'default-profile.png' },
    eus_career: { type: DataTypes.STRING },
    workplace: { type: DataTypes.STRING },
    skills: { type: DataTypes.TEXT },
  }, {
    tableName: 'employees',
    timestamps: false,
  });

  const Education = require('./Education')(sequelize);
  const Career = require('./Career')(sequelize);
  const Certification = require('./Certification')(sequelize);
  const ExternalProject = require('./ExternalProject')(sequelize);

  Employee.hasMany(Education, { foreignKey: 'employee_id', as: 'educations' });
  Education.belongsTo(Employee, { foreignKey: 'employee_id' });

  Employee.hasMany(Career, { foreignKey: 'employee_id', as: 'careers' });
  Career.belongsTo(Employee, { foreignKey: 'employee_id' });

  Employee.hasMany(Certification, { foreignKey: 'employee_id', as: 'certifications' });
  Certification.belongsTo(Employee, { foreignKey: 'employee_id' });

  Employee.hasMany(ExternalProject, { foreignKey: 'employee_id', as: 'external_projects' });
  ExternalProject.belongsTo(Employee, { foreignKey: 'employee_id' });

  return Employee;
};
