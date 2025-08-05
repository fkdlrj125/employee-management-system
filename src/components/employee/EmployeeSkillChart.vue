<template>
  <div class="skill-chart-container">
    <div class="chart-header">
      <h4 class="section-title">기술 역량 평가</h4>
      <div v-if="editMode" class="chart-controls">
        <button @click="showSkillModal = true" class="btn btn-secondary btn-sm">평가 입력</button>
      </div>
    </div>

    <div class="chart-wrapper">
      <canvas ref="chartCanvas" width="400" height="400"></canvas>
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
              <label>{{ skill.label }}</label>
              <div class="score-input">
                <input type="range" min="0" max="10" v-model="skill.score" class="skill-slider" />
                <span class="score-display">{{ skill.score }}/10</span>
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

// Chart.js 컴포넌트 등록
Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

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
  },
  data() {
    return {
      chart: null,
      showSkillModal: false,
      skillCategories: [
        { label: '기술 전문성', score: 0 },
        { label: '문제 해결', score: 0 },
        { label: '소통 능력', score: 0 },
        { label: '리더십', score: 0 },
        { label: '창의성', score: 0 },
        { label: '팀워크', score: 0 },
      ],
    };
  },
  watch: {
    employee: {
      handler() {
        this.loadSkillData();
        this.updateChart();
      },
      deep: true,
    },
  },
  mounted() {
    this.loadSkillData();
    this.initChart();
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
  methods: {
    loadSkillData() {
      if (this.employee.skillScores) {
        this.skillCategories.forEach((category, index) => {
          if (this.employee.skillScores[index] !== undefined) {
            category.score = this.employee.skillScores[index];
          }
        });
      }
    },

    initChart() {
      const ctx = this.$refs.chartCanvas.getContext('2d');
      // 순수 객체로 변환 (reactive 방지)
      const skillCategoriesCopy = JSON.parse(JSON.stringify(this.skillCategories));
      this.chart = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: skillCategoriesCopy.map((skill) => skill.label),
          datasets: [
            {
              label: '현재 역량',
              data: skillCategoriesCopy.map((skill) => skill.score),
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 2,
              pointBackgroundColor: 'rgba(54, 162, 235, 1)',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              beginAtZero: true,
              max: 10,
              min: 0,
              ticks: {
                stepSize: 2,
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
            legend: {
              display: false,
            },
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
          },
        },
      });
    },

    updateChart() {
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      this.initChart();
    },

    saveSkillScores() {
      const scores = this.skillCategories.map((skill) => parseInt(skill.score));
      this.$emit('update:employee', {
        ...this.employee,
        skillScores: scores,
      });
      this.updateChart();
      this.closeModal();
    },

    closeModal() {
      this.showSkillModal = false;
    },
  },
};
</script>

<style scoped>
.skill-chart-container {
  margin-bottom: 30px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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
}
</style>
