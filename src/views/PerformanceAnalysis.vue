<template>
  <div class="performance-analysis-container">
    <div class="pa-header-row">
      <EmployeeDetailHeader
        :edit-mode="false"
        :is-add-mode="false"
        :current-user="currentUser"
        :search-error="''"
        @logout="onLogout"
      >
        <template #left-extra>
          <button
            class="btn-back-detail-icon"
            :title="'상세로 돌아가기'"
            @click="employee && goToDetail()"
            tabindex="0"
          >
            <i class="fas fa-arrow-left"></i>
          </button>
        </template>
      </EmployeeDetailHeader>
    </div>
    <div v-if="employee">
      <div class="pa-emp-info-row">
        <span class="pa-emp-name">{{ employee.name }}</span>
        <span class="pa-emp-meta">{{ employee.department }} / {{ employee.position }}</span>
      </div>
      <div class="year-select-row">
        <label for="year-select" class="year-select-label">연도 선택:</label>
        <select id="year-select" v-model="selectedYear" class="year-select">
          <option value="">전체</option>
          <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>
      <div v-if="analysisInfo">
        <div class="analysis-info-row">
          <strong>평균 점수:</strong> {{ analysisInfo.avgScore.toFixed(2) }}
          <span v-if="analysisInfo.growthRate !== null">&nbsp;|&nbsp;<strong>성장률:</strong> {{ (analysisInfo.growthRate*100).toFixed(1) }}%</span>
        </div>
      </div>
      <EmployeeSkillChart
        :employee="employee"
        :evaluationHistory="filteredHistory"
        :editMode="false"
      />
    </div>
    <div v-else>
      <p>직원을 선택하거나 URL로 접근해 주세요.</p>
    </div>
  </div>
</template>

<script>
import EmployeeSkillChart from '@/components/employee/detail/EmployeeSkillChart.vue';
import EmployeeDetailHeader from '@/components/employee/detail/EmployeeDetailHeader.vue';
import EmployeeApiService from '@/services/EmployeeApiService.js';

export default {
  name: 'PerformanceAnalysis',
  components: { EmployeeSkillChart, EmployeeDetailHeader },
  data() {
    return {
      employee: null,
      evaluationHistory: [],
      selectedYear: '',
      currentUser: JSON.parse(localStorage.getItem('currentUser') || '{}'),
    };
  },
  methods: {
    goToDetail() {
      console.log('[goToDetail] employee:', this.employee);
      if (this.employee && this.employee.id) {
        const route = `/employee-detail/${this.employee.id}`;
        console.log('[goToDetail] route:', route);
        this.$router.push(route);
      } else {
        console.warn('[goToDetail] employee or employee.id is missing');
      }
    },
    onLogout() {
      // 로그아웃 시 메인으로 이동
      sessionStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      this.$router.push('/login');
    }
  },
  computed: {
    yearOptions() {
      // 평가 이력에서 연도 목록 추출(내림차순)
      const years = (this.evaluationHistory || []).map(e => new Date(e.evaluation_date).getFullYear());
      return [...new Set(years)].sort((a,b) => b-a);
    },
    filteredHistory() {
      if (!this.selectedYear) return this.evaluationHistory;
      return this.evaluationHistory.filter(e => new Date(e.evaluation_date).getFullYear() == this.selectedYear);
    },
    analysisInfo() {
      const arr = this.filteredHistory;
      if (!arr.length) return null;
      // 모든 score1~6 평균
      let total = 0, count = 0;
      arr.forEach(e => {
        for (let i=1; i<=6; i++) {
          const v = Number(e[`score${i}`]);
          if (!isNaN(v)) { total += v; count++; }
        }
      });
      // 성장률: 첫 연도 평균 대비 마지막 연도 평균
      let growthRate = null;
      if (arr.length > 1) {
        const first = arr[0], last = arr[arr.length-1];
        let firstSum=0, firstCnt=0, lastSum=0, lastCnt=0;
        for (let i=1; i<=6; i++) {
          const fv = Number(first[`score${i}`]);
          const lv = Number(last[`score${i}`]);
          if (!isNaN(fv)) { firstSum+=fv; firstCnt++; }
          if (!isNaN(lv)) { lastSum+=lv; lastCnt++; }
        }
        if (firstCnt && lastCnt) {
          const firstAvg = firstSum/firstCnt;
          const lastAvg = lastSum/lastCnt;
          growthRate = (lastAvg - firstAvg) / (firstAvg || 1);
        }
      }
      return { avgScore: count ? total/count : 0, growthRate };
    }
  },
  async created() {
    // URL 파라미터에서 직원 ID 추출 (예: /performance-analysis/:id)
    const id = this.$route.params.id;
    if (id) {
      try {
        const emp = await EmployeeApiService.getEmployeeById(id);
        this.employee = emp && emp.data ? emp.data : emp;
        // 실제 API 연동 시 emp.data가 직원 정보 객체이므로, emp.data로만 할당
        if (emp && emp.data) this.employee = emp.data;
        const history = await EmployeeApiService.getEvaluationHistory(id);
        // 연도 오름차순 정렬
        this.evaluationHistory = (history || []).sort((a,b) => new Date(a.evaluation_date) - new Date(b.evaluation_date));
      } catch (e) {
        console.error('직원 정보/이력 조회 실패:', e);
      }
    }
  }
};
</script>

<style scoped>
.performance-analysis-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 16px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.pa-header-row {
  margin-bottom: 10px;
}
  .btn-back-detail-icon {
    background: #fff;
    color: #007bff;
    border: 1.5px solid #bfc9d1;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    margin-right: 8px;
    cursor: pointer;
    transition: background 0.18s, color 0.18s, border 0.18s;
  }
  .btn-back-detail-icon:hover {
    background: #e7f1ff;
    color: #0056b3;
    border-color: #007bff;
  }
.performance-analysis-container h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 32px;
  color: #007bff;
}
.pa-emp-info-row {
  display: flex;
  align-items: baseline;
  gap: 18px;
  margin-bottom: 10px;
}
.pa-emp-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #222;
}
.pa-emp-meta {
  font-size: 1rem;
  color: #666;
}
.year-select-row {
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.year-select-label {
  font-weight: 600;
}
.year-select {
  padding: 4px 10px;
  border-radius: 5px;
  border: 1px solid #bfc9d1;
  font-size: 1rem;
  background: #f8f9fa;
}
.analysis-info-row {
  margin-bottom: 12px;
  font-size: 1.08rem;
  color: #333;
  font-weight: 500;
}
</style>
