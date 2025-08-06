<template>
  <div class="table-container">
    <table class="employee-table">
      <thead>
        <tr>
          <th>번호</th>
          <th class="sortable" @click="$emit('sort', 'name')">
            이름 <i :class="getSortIcon('name')"></i>
          </th>
          <th class="sortable" @click="$emit('sort', 'department')">
            부서 <i :class="getSortIcon('department')"></i>
          </th>
          <th class="sortable" @click="$emit('sort', 'workplace')">
            근무지 <i :class="getSortIcon('workplace')"></i>
          </th>
          <th class="sortable" @click="$emit('sort', 'position')">
            직급 <i :class="getSortIcon('position')"></i>
          </th>
          <th class="sortable" @click="$emit('sort', 'hire_date')">
            입사일 <i :class="getSortIcon('hire_date')"></i>
          </th>
          <th>주소</th>
          <th class="sortable" @click="$emit('sort', 'total_score')">
            통합 평가 점수 <i :class="getSortIcon('total_score')"></i>
          </th>
          <th class="sortable" @click="$emit('sort', 'mitmas_total_career')">
            MITMAS 경력 <i :class="getSortIcon('mitmas_total_career')"></i>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="9" class="loading-cell">
            <i class="fas fa-spinner fa-spin"></i> 로딩 중...
          </td>
        </tr>
        <tr v-else-if="filteredEmployees.length === 0">
          <td colspan="9" class="no-data-cell">검색 결과가 없습니다.</td>
        </tr>
        <tr
          v-else
          v-for="(employee, index) in paginatedEmployees"
          :key="employee.id"
          @click="$emit('detail', employee.id)"
          :class="['employee-row', getDepartmentClass(employee.department)]"
        >
          <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
          <td>{{ employee.name }}</td>
          <td>
            <span :class="['department-badge', getDepartmentClass(employee.department)]">
              {{ employee.department }}
            </span>
          </td>
          <td>{{ employee.workplace }}</td>
          <td>
            <span :class="['position-badge', getPositionClass(employee.position)]">
              {{ employee.position }}
            </span>
          </td>
          <td>{{ formatDate(employee.hire_date) }}</td>
          <td>{{ employee.address || '-' }}</td>
          <td>{{ employee.total_score || '-' }}</td>
          <td>{{ formatCareer(employee.mitmas_total_career) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({
  loading: Boolean,
  filteredEmployees: Array,
  paginatedEmployees: Array,
  currentPage: Number,
  pageSize: Number,
  getSortIcon: Function,
  getDepartmentClass: Function,
  getPositionClass: Function,
  formatDate: Function,
  formatCareer: Function,
});
const emit = defineEmits(['sort', 'detail']);
</script>
