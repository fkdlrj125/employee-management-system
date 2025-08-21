<template>
  <div class="table-container">
    <table class="employee-table">
      <thead>
        <tr>
          <th class="col-num">번호</th>
          <th class="sortable col-name" @click="$emit('sort', 'name')">
            이름 <i :class="getSortIcon('name')"></i>
          </th>
          <th class="sortable col-dept" @click="$emit('sort', 'department')">
            부서 <i :class="getSortIcon('department')"></i>
          </th>
          <th class="sortable col-workplace" @click="$emit('sort', 'workplace')">
            근무지 <i :class="getSortIcon('workplace')"></i>
          </th>
          <th class="sortable col-position" @click="$emit('sort', 'position')">
            직급 <i :class="getSortIcon('position')"></i>
          </th>
          <th class="sortable col-hire" @click="$emit('sort', 'hire_date')">
            입사일 <i :class="getSortIcon('hire_date')"></i>
          </th>
          <th class="col-address">주소</th>
          <th class="sortable col-score" @click="$emit('sort', 'total_score')">
            통합 평가 점수 <i :class="getSortIcon('total_score')"></i>
          </th>
          <th class="sortable col-career" @click="$emit('sort', 'mitmas_total_career')">
            MITMAS 경력 <i :class="getSortIcon('mitmas_total_career')"></i>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="9"><Loading /></td>
        </tr>
        <tr v-else-if="employees?.length === 0">
          <td colspan="9"><NoData /></td>
        </tr>
        <tr
          v-for="(employee, index) in employees || []"
          :key="employee.id"
          @click="$emit('detail', employee.id)"
          :class="['employee-row', getDepartmentClass(employee.department)]"
        >
          <td class="col-num">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
          <td class="col-name">{{ employee.name }}</td>
          <td class="col-dept">
            <span :class="['department-badge', getDepartmentClass(employee.department)]">
              {{ employee.department }}
            </span>
          </td>
          <td class="col-workplace">{{ employee.workplace }}</td>
          <td class="col-position">
            <span :class="['position-badge', getPositionClass(employee.position)]">
              {{ employee.position }}
            </span>
          </td>
          <td class="col-hire">{{ formatDate(employee.hire_date) }}</td>
          <td class="col-address">{{ employee.address || '-' }}</td>
          <td class="col-score">
            <div style="display: flex; flex-direction: column; align-items: flex-start;">
              <span v-if="employee.member_total_score !== undefined">
                <strong>멤버:</strong> {{ employee.member_total_score }}
              </span>
              <span v-if="employee.leader_total_score !== undefined">
                <strong>리더:</strong> {{ employee.leader_total_score }}
              </span>
            </div>
          </td>
          <td class="col-career">
            <!-- 입사일로부터 오늘까지 계산된 mitmas경력 -->
            {{ getMitmasCareer ? getMitmasCareer(employee.hire_date) : formatCareer(employee.mitmas_total_career) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import Loading from '@/components/common/Loading.vue';
import NoData from '@/components/common/NoData.vue';
const props = defineProps({
  loading: Boolean,
  employees: {
    type: Array,
    default: () => [],
  },
  currentPage: Number,
  pageSize: Number,
  getSortIcon: Function,
  getDepartmentClass: Function,
  getPositionClass: Function,
  formatDate: Function,
  formatCareer: Function,
  getMitmasCareer: Function,
});
const emit = defineEmits(['sort', 'detail']);
</script>
<style scoped>
/* 테이블 컬럼 비율 클래스 */
.col-num { width: 6%; }
.col-name { width: 7%; }
.col-dept { width: 6%; }
.col-workplace { width: 7%; }
.col-position { width: 6%; }
.col-hire { width: 9%; }
.col-address { width: 26%; }
.col-score { width: 8%; }
.col-career { width: 10%; }

.loading-cell-overlay {
  position: relative;
  height: 60px;
  background: rgba(255,255,255,0.7);
  z-index: 2;
}
.table-loading-overlay {
  position: absolute;
  left: 0; right: 0; top: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #2563eb;
  background: rgba(255,255,255,0.7);
  z-index: 3;
}
</style>
