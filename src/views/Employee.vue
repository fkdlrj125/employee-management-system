management\src\views\Employee.vue
<template>
  <div class="employee">
    <h1>직원 관리</h1>
    <div class="employee-actions">
      <button class="btn btn-primary" @click="showForm = true">직원 추가</button>
    </div>

    <!-- 직원 목록 테이블 -->
    <div class="employee-list" v-if="!showForm">
      <table>
        <thead>
          <tr>
            <th>사번</th>
            <th>이름</th>
            <th>부서</th>
            <th>직급</th>
            <th>입사일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in allEmployees" :key="employee.id">
            <td>{{ employee.id }}</td>
            <td>{{ employee.name }}</td>
            <td>{{ employee.department }}</td>
            <td>{{ employee.position }}</td>
            <td>{{ employee.joinDate }}</td>
            <td>
              <button class="btn btn-sm" @click="handleEdit(employee)">수정</button>
              <button class="btn btn-sm btn-danger" @click="handleDelete(employee.id)">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 직원 추가/수정 폼 -->
    <employee-form
      v-if="showForm"
      :employee="selectedEmployee"
      :is-edit="!!selectedEmployee"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import EmployeeForm from '@/components/employee/detail/EmployeeForm.vue';

export default {
  name: 'Employee',
  components: {
    EmployeeForm,
  },
  data() {
    return {
      showForm: false,
      selectedEmployee: null,
    };
  },
  computed: {
    ...mapGetters('employee', ['allEmployees']),
  },
  methods: {
    ...mapActions('employee', [
      'fetchEmployees',
      'addEmployee',
      'updateEmployee',
      'deleteEmployee',
    ]),
    handleEdit(employee) {
      this.selectedEmployee = { ...employee };
      this.showForm = true;
    },
    async handleSubmit(employee) {
      if (this.selectedEmployee) {
        await this.updateEmployee({ ...this.selectedEmployee, ...employee });
      } else {
        await this.addEmployee({
          id: `EMP${Date.now()}`,
          ...employee,
        });
      }
      this.handleCancel();
    },
    handleCancel() {
      this.showForm = false;
      this.selectedEmployee = null;
    },
    async handleDelete(id) {
      if (confirm('정말 삭제하시겠습니까?')) {
        await this.deleteEmployee(id);
      }
    },
  },
  created() {
    this.fetchEmployees();
  },
};
</script>

<style scoped>
.employee {
  padding: 20px;
}

.employee-actions {
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}
</style>

