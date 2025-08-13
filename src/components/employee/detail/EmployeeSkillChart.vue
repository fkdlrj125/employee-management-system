<template>
  <div class="skill-chart-container" :class="{ 'with-anim': firstMount }">

    <div class="chart-header chart-header-flex">
      <div class="chart-title-group">
        <h4 class="section-title">기술 역량 평가</h4>
        <button
          class="btn btn-secondary btn-sm role-toggle-single"
          @click="toggleRole"
          :title="selectedRole === 'member' ? '리더 평가로 전환' : '멤버 평가로 전환'"
        >
          <span v-if="selectedRole === 'member'">리더 평가로 전환</span>
          <span v-else>멤버 평가로 전환</span>
        </button>
      </div>
      <div v-if="editMode" class="chart-controls">
        <button @click="showSkillModal = true" class="btn btn-secondary btn-sm">평가 입력</button>
      </div>
    </div>


    <div class="chart-wrapper">
      <canvas ref="chartCanvas" width="400" height="400"></canvas>
    </div>
    <button
      class="btn btn-secondary btn-sm"
      style="margin-top: 10px;"
      @click="$emit('go-to-period-analysis')"
    >
      기간별 기술 역량 분석 페이지로 이동
    </button>

    <!-- 연도별 점수 변화 차트 -->
    <div class="chart-wrapper" v-if="evaluationHistory && evaluationHistory.length">
      <canvas ref="historyChartCanvas" width="400" height="300"></canvas>
    </div>

    <!-- 기술 평가 입력 모달 -->
    <div v-if="showSkillModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>기술 역량 평가</h3>
          <button @click="closeModal" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="skill-inputs">
            <div v-for="(skill, index) in skillCategories" :key="index" class="skill-input-group">
              <label>{{ skill.label[0] + skill.label[1] }}</label>
              <div class="score-input">
                <input type="range" min="0" max="5" v-model="skill.score" class="skill-slider" />
                <span class="score-display">{{ skill.score }}/5</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">취소</button>
          <button @click="saveSkillScores" class="btn btn-primary">저장</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
 import employeeApiService from '@/services/employee-api-service';

// Chart.js 컴포넌트 등록 (Filler는 unregister)
Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);
Chart.unregister(Filler);

export default {
  name: 'EmployeeSkillChart',
  props: {
    employee: {
      type: Object,
      required: true,
    },
    editMode: {
      type: Boolean,
      default: false,
    },
    evaluationHistory: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      chart: null,
      historyChart: null,
      showSkillModal: false,
      selectedRole: 'member',
      memberSkills: [
        { label: ['기술 전문성'], score: 0 },
        { label: ['문제 해결'], score: 0 },
        { label: ['소통 능력'], score: 0 },
        { label: ['리더십'], score: 0 },
        { label: ['창의성'], score: 0 },
        { label: ['팀워크'], score: 0 },
      ],
      leaderSkills: [
        { label: ['직무역량과 ', '판단력'], score: 0 },
        { label: ['팀 리더십 및 ', '관리 능력'], score: 0 },
        { label: ['고객 소통 및 ', '서비스 마인드'], score: 0 },
        { label: ['운영 계획 및 ', '실행 능력'], score: 0 },
        { label: ['준수 사항 및 ', '문서 관리'], score: 0 },
        { label: ['혁신 및 ', '지속적인 개선 노력'], score: 0 },
      ],
      firstMount: true,
    };
  },
  computed: {
    skillCategories() {
      return this.selectedRole === 'leader' ? this.leaderSkills : this.memberSkills;
    }
  },
  watch: {
    'employee.skillScores': {
      handler(newVal, oldVal) {
        if (this.selectedRole === 'member' && JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
          this.loadSkillData();
          this.updateChart();
        }
      },
      deep: false,
      immediate: false,
    },
    'employee.leaderSkillScores': {
      handler(newVal, oldVal) {
        if (this.selectedRole === 'leader' && JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
          this.loadSkillData();
          this.updateChart();
        }
      },
      deep: false,
      immediate: false,
    },
    selectedRole() {
      this.loadSkillData();
      this.updateChart();
    },
    // score 값만 감지해서 차트 갱신
    'memberSkills.map(skill => skill.score)': {
      handler() {
        if (this.selectedRole === 'member') this.updateChart();
      },
      deep: true,
    },
    'leaderSkills.map(skill => skill.score)': {
      handler() {
        if (this.selectedRole === 'leader') this.updateChart();
      },
      deep: true,
    },
  },
  mounted() {
    console.log('[EmployeeSkillChart] mounted');
    this.loadSkillData();
    this.initChart();
    this.initHistoryChart();
    setTimeout(() => {
      this.firstMount = false;
    }, 700);
  },
  beforeUnmount() {
    console.log('[EmployeeSkillChart] beforeUnmount');
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.historyChart) {
      this.historyChart.destroy();
    }
  },
  methods: {
    toggleRole() {
      this.selectedRole = this.selectedRole === 'member' ? 'leader' : 'member';
    },
    loadSkillData() {
      // selectedRole에 따라 본인/리더 평가 점수 분기 적용
      const scores = this.selectedRole === 'leader'
        ? (this.employee.leaderSkillScores || [])
        : (this.employee.skillScores || []);
      const arr = this.selectedRole === 'leader' ? this.leaderSkills : this.memberSkills;
      arr.forEach((category, index) => {
        if (scores[index] !== undefined) {
          category.score = scores[index];
        }
      });
    },

    initChart() {
      try {
        const ctx = this.$refs.chartCanvas.getContext('2d');
        // 순수 객체로 변환 (reactive 방지)
        let skillCategoriesCopy = JSON.parse(JSON.stringify(this.skillCategories || []));
        // skillCategories가 비어있으면 최소 1개 dummy라도 넣기
        if (!Array.isArray(skillCategoriesCopy) || skillCategoriesCopy.length === 0) {
          skillCategoriesCopy = [{ label: 'N/A', score: 0 }];
        }
        // score가 숫자인지, NaN/undefined가 아닌지 보장
        const safeScores = skillCategoriesCopy.map((skill) => {
          const n = parseInt(skill.score, 10);
          return isNaN(n) ? 0 : n;
        });
        // datasets/data가 항상 1개 이상
        const datasets = [
          {
            label: '현재 역량',
            data: safeScores,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
          },
        ].filter(ds => ds && Array.isArray(ds.data) && ds.data.length > 0);
        const plugins = {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            callbacks: {
              label: function (context) {
                return `${context.label}: ${context.parsed.r}/10`;
              },
            },
          },
          filler: false, // Filler 플러그인 비활성화
        };
        // 콘솔로 데이터 구조 확인
        this.chart = new Chart(ctx, {
          type: 'radar',
          data: {
            labels: skillCategoriesCopy.map((skill) => skill.label),
            datasets,
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                beginAtZero: true,
                max: 5,
                min: 0,
                ticks: {
                  stepSize: 1,
                  display: false,
                  showLabelBackdrop: false,
                  color: '#666',
                },
                grid: {
                  color: '#e0e0e0',
                },
                pointLabels: {
                  font: {
                    size: 12,
                  },
                  color: '#333',
                },
              },
            },
            plugins: {
              ...plugins,
              filler: false
            },
          },
        });
      } catch (e) {
        console.error('initChart error:', e);
      }
    },

    // 연도별 점수 변화 라인차트(또는 레이더차트) 추가
    initHistoryChart() {
      if (!this.$refs.historyChartCanvas) return;
      if (this.historyChart) {
        this.historyChart.destroy();
        this.historyChart = null;
      }
      // 연도별 점수 변화 데이터 준비
      const history = Array.isArray(this.evaluationHistory) ? this.evaluationHistory : [];
      if (!history.length) return;
      // 연도 오름차순 정렬
      const sorted = [...history].sort((a, b) => new Date(a.evaluation_date) - new Date(b.evaluation_date));
      const labels = sorted.map(item => {
        const d = new Date(item.evaluation_date);
        return d.getFullYear();
      });
      // 각 점수별 변화 추이
      const scoreFields = ['score1','score2','score3','score4','score5','score6'];
      const datasets = scoreFields.map((field, idx) => ({
        label: `점수${idx+1}`,
        data: sorted.map(item => Number(item[field]) || 0),
        fill: false,
        borderColor: `hsl(${idx*60},70%,50%)`,
        backgroundColor: `hsl(${idx*60},70%,80%)`,
        tension: 0.2,
      }));
      const ctx = this.$refs.historyChartCanvas.getContext('2d');
      this.historyChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets,
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true },
            title: { display: true, text: '연도별 점수 변화(성장 추이)' },
          },
          scales: {
            y: { beginAtZero: true, max: 5, min: 0, stepSize: 1 },
          },
        },
      });
    },

    updateChart() {
      try {
        if (this.chart) {
          this.chart.destroy();
          this.chart = null;
        }
        // 콘솔로 데이터 구조 확인
        this.initChart();
      } catch (e) {
        console.error('Chart update error:', e);
        if (this.chart && this.chart.data) {
        }
      }
    },

    async saveSkillScores() {
      // skillCategories가 비어있으면 최소 1개 dummy라도 넣기
      const arr = this.selectedRole === 'leader' ? this.leaderSkills : this.memberSkills;
      const safeCategories = arr.length > 0 ? arr : [{ label: 'N/A', score: 0 }];
      const scores = safeCategories.map((skill) => {
        const n = parseInt(skill.score, 10);
        if (isNaN(n)) return 0;
        return n > 5 ? 5 : n;
      });
      let payload = {};
      if (this.selectedRole === 'leader') {
        payload.leaderSkillScores = scores;
      } else {
        payload.skillScores = scores;
      }
      try {
        const res = await employeeApiService.updateEmployeeSkillScores(this.employee.id, payload);
        if (res.success) {
          // 프론트 상태도 즉시 반영
          if (this.selectedRole === 'leader') {
            this.$emit('update:employee', { ...this.employee, leaderSkillScores: scores });
          } else {
            this.$emit('update:employee', { ...this.employee, skillScores: scores });
          }
          this.updateChart();
          this.closeModal();
        } else {
          alert(res.error || '저장에 실패했습니다.');
        }
      } catch (e) {
        alert('저장 중 오류가 발생했습니다.');
      }
    },

    closeModal() {
      this.showSkillModal = false;
    },
  },
};
</script>

<style scoped>

.skill-chart-container {
  /* .table-container의 레이아웃/배경 스타일 복사 */
  padding: 32px 24px 24px 24px;
  margin-bottom: 28px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.skill-chart-container.with-anim {
  animation: fadeInUp 0.6s ease-out;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.chart-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-toggle-single {
  margin-left: 8px;
  min-width: 110px;
}

.section-title {
  color: #343a40;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #007bff;
}

.chart-controls .btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}

.chart-wrapper {
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #343a40;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #343a40;
}

.modal-body {
  padding: 20px;
}

.skill-inputs {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skill-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skill-input-group label {
  font-weight: 600;
  color: #343a40;
}

.score-input {
  display: flex;
  align-items: center;
  gap: 15px;
}

.skill-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e9ecef;
  outline: none;
  appearance: none;
}

.skill-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.skill-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.score-display {
  min-width: 50px;
  text-align: center;
  font-weight: 600;
  color: #007bff;
  background: #e7f3ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

@media (max-width: 768px) {
  .chart-wrapper {
    height: 300px;
    padding: 15px;
  }

  .modal-content {
    width: 95%;
    margin: 10px;
  }

  .score-input {
    flex-direction: column;
    align-items: stretch;
  }

  .score-display {
    align-self: center;
  }
  .skill-chart-container {
    padding: 10px 4px 8px 4px;
    margin-bottom: 10px;
    border-radius: 8px;
  }
  .chart-header {
    margin-bottom: 10px;
  }
  .section-title {
    font-size: 15px;
    padding-bottom: 4px;
  }
  .btn, .btn-primary, .btn-secondary {
    font-size: 13px;
    padding: 6px 10px;
    border-radius: 4px;
  }
  .score-display {
    font-size: 12px;
    padding: 2px 6px;
    min-width: 36px;
  }
}
</style>
