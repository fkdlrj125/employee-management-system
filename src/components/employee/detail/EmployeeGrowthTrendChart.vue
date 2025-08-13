<template>
  <div class="growth-trend-chart">
    <div class="trend-header">
      <label>역할:</label>
      <select v-model="selectedRole" @change="onRoleChange">
        <option value="member">멤버</option>
        <option value="leader">리더</option>
      </select>
      <label>기간:</label>
      <input type="month" v-model="from" @change="onPeriodChange" /> ~
      <input type="month" v-model="to" @change="onPeriodChange" />
    </div>
    <div v-if="loading" class="loading">데이터 불러오는 중...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <canvas v-else ref="chart"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';
 import employeeApiService from '@/services/employee-api-service';

export default {
  name: 'EmployeeGrowthTrendChart',
  props: {
    employeeId: { type: [String, Number], required: true },
    defaultRole: { type: String, default: 'member' },
    defaultFrom: { type: String, default: '' },
    defaultTo: { type: String, default: '' },
  },
  data() {
    return {
      selectedRole: this.defaultRole,
      from: this.defaultFrom,
      to: this.defaultTo,
      loading: false,
      error: '',
      trend: [],
      chartInstance: null,
    };
  },
  watch: {
    employeeId: 'fetchTrend',
    selectedRole: 'fetchTrend',
    from: 'fetchTrend',
    to: 'fetchTrend',
  },
  mounted() {
    if (!this.from || !this.to) {
      const now = new Date();
      const to = now.toISOString().slice(0, 7);
      const from = new Date(now.getFullYear(), now.getMonth() - 11, 1)
        .toISOString()
        .slice(0, 7);
      this.from = from;
      this.to = to;
    }
    this.fetchTrend();
  },
  methods: {
    async fetchTrend() {
      if (!this.employeeId || !this.from || !this.to) return;
      this.loading = true;
      this.error = '';
      try {
        const res = await employeeApiService.getPerformanceTrend(this.employeeId, {
          role: this.selectedRole,
          from: this.from,
          to: this.to,
        });
        if (res.success) {
          this.trend = res.data;
          this.renderChart();
        } else {
          this.error = res.error || '데이터를 불러오지 못했습니다.';
        }
      } catch (e) {
        this.error = e.message || '데이터를 불러오지 못했습니다.';
      } finally {
        this.loading = false;
      }
    },
    renderChart() {
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }
      if (!this.trend || this.trend.length === 0) return;
      // 기간 라벨
      const labels = this.trend.map((t) => t.period);
      // 모든 항목 추출
      const allSkills = Array.from(
        new Set(this.trend.flatMap((t) => Object.keys(t.scores || {})))
      );
      // 항목별 데이터셋
      const datasets = allSkills.map((skill, idx) => ({
        label: skill,
        data: this.trend.map((t) => t.scores[skill] ?? 0),
        borderColor: `hsl(${(idx * 60) % 360}, 70%, 50%)`,
        backgroundColor: 'rgba(0,0,0,0)',
        tension: 0.2,
      }));
      const ctx = this.$refs.chart.getContext('2d');
      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: '기간별 성장 추이' },
          },
          scales: {
            y: { beginAtZero: true, min: 0, max: 5, stepSize: 1 },
          },
        },
      });
    },
    onRoleChange() {
      // fetchTrend는 watch로 자동 호출됨
    },
    onPeriodChange() {
      // fetchTrend는 watch로 자동 호출됨
    },
  },
};
</script>

<style scoped>
.growth-trend-chart {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.trend-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.loading { color: #888; }
.error { color: #d00; }
</style>
