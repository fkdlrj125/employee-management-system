// backend/services/EmployeeService.js
const EmployeeDAO = require('../dao/EmployeeDAO');
const EmployeeDTO = require('../dto/EmployeeDTO');

class EmployeeService {
  async getEmployees(options) {
    const result = await EmployeeDAO.findAll(options);
    // DTO 변환(배열)
    return {
      ...result,
      employees: result.employees.map(e => new EmployeeDTO(e))
    };
  }

  async getEmployeeById(id) {
    const data = await EmployeeDAO.findById(id);
    return data ? new EmployeeDTO(data) : null;
  }

  async createEmployee(data) {
    const created = await EmployeeDAO.create(data);
    return new EmployeeDTO(created);
  }

  async updateEmployee(id, data) {
    console.log('[SERVICE][UPDATE] id:', id, 'employeeData:', JSON.stringify(data));
    const updated = await EmployeeDAO.update(id, data);
    return new EmployeeDTO(updated);
  }

  async deleteEmployee(id) {
    return EmployeeDAO.delete(id);
  }
}

module.exports = new EmployeeService();
