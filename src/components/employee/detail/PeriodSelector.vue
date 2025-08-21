<template>
  <div class="period-selector-container">
    <div class="period-header">
      <h4 class="section-title">기간별 성과 분석</h4>
      <div class="period-controls">
        <button @click="showPeriodModal = true" class="btn btn-secondary btn-sm">기간 선택</button>
        <button @click="generateReport" class="btn btn-primary btn-sm" :disabled="!selectedPeriod">
          리포트 생성
        </button>
      </div>
    </div>

    <div class="current-period" v-if="selectedPeriod">
      <div class="period-info">
        <span class="period-label">선택된 기간:</span>
        <span class="period-value">{{ formatPeriod(selectedPeriod) }}</span>
      </div>
    </div>

    <div class="performance-summary" v-if="performanceData">
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-label">완료 프로젝트</div>
          <div class="summary-value">{{ performanceData.completedProjects }}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">평균 평가점수</div>
          <div class="summary-value">{{ performanceData.averageScore }}/10</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">성과 등급</div>
          <div class="summary-value" :class="getGradeClass(performanceData.grade)">
            {{ performanceData.grade }}
          </div>
        </div>
        <div class="summary-item">
          <div class="summary-label">달성률</div>
          <div class="summary-value">{{ performanceData.achievementRate }}%</div>
        </div>
      </div>
    </div>

    <!-- 기간 선택 모달 -->
    <div v-if="showPeriodModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>평가 기간 선택</h3>
          <button @click="closeModal" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="period-options">
            <div class="period-option">
              <label>
                <input type="radio" v-model="tempPeriodType" value="quarter" />
                분기별 평가
              </label>
            </div>
            <div class="period-option">
              <label>
                <input type="radio" v-model="tempPeriodType" value="half" />
                반기별 평가
              </label>
            </div>
            <div class="period-option">
              <label>
                <input type="radio" v-model="tempPeriodType" value="year" />
                연간 평가
              </label>
            </div>
            <div class="period-option">
              <label>
                <input type="radio" v-model="tempPeriodType" value="custom" />
                사용자 정의
              </label>
            </div>
          </div>

          <div v-if="tempPeriodType === 'quarter'" class="period-details">
            <div class="input-group">
              <label>연도</label>
              <select v-model="tempYear">
                <option v-for="year in availableYears" :key="year" :value="year">
                  {{ year }}년
                </option>
              </select>
            </div>
            <div class="input-group">
              <label>분기</label>
              <select v-model="tempQuarter">
                <option value="1">1분기 (1-3월)</option>
                <option value="2">2분기 (4-6월)</option>
                <option value="3">3분기 (7-9월)</option>
                <option value="4">4분기 (10-12월)</option>
              </select>
            </div>
          </div>

          <div v-if="tempPeriodType === 'half'" class="period-details">
            <div class="input-group">
              <label>연도</label>
              <select v-model="tempYear">
                <option v-for="year in availableYears" :key="year" :value="year">
                  {{ year }}년
                </option>
              </select>
            </div>
            <div class="input-group">
              <label>반기</label>
              <select v-model="tempHalf">
                <option value="1">상반기 (1-6월)</option>
                <option value="2">하반기 (7-12월)</option>
              </select>
            </div>
          </div>

          <div v-if="tempPeriodType === 'year'" class="period-details">
            <div class="input-group">
              <label>연도</label>
              <select v-model="tempYear">
                <option v-for="year in availableYears" :key="year" :value="year">
                  {{ year }}년
                </option>
              </select>
            </div>
          </div>

          <div v-if="tempPeriodType === 'custom'" class="period-details">
            <div class="input-group">
              <label>시작일</label>
              <input type="date" v-model="tempStartDate" />
            </div>
            <div class="input-group">
              <label>종료일</label>
              <input type="date" v-model="tempEndDate" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">취소</button>
          <button @click="applyPeriod" class="btn btn-primary">적용</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmployeePeriodSelector',
  props: {
    employee: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showPeriodModal: false,
      selectedPeriod: null,
      performanceData: null,
      tempPeriodType: 'quarter',
      tempYear: new Date().getFullYear(),
      tempQuarter: '1',
      tempHalf: '1',
      tempStartDate: '',
      tempEndDate: '',
      availableYears: [],
    };
  },
  created() {
    this.initializeYears();
    this.loadDefaultPeriod();
  },
  methods: {
    initializeYears() {
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 5;
      this.availableYears = [];
      for (let year = currentYear; year >= startYear; year--) {
        this.availableYears.push(year);
      }
    },

    loadDefaultPeriod() {
      // 기본적으로 현재 분기를 선택
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentQuarter = Math.ceil(currentMonth / 3);

      this.selectedPeriod = {
        type: 'quarter',
        year: now.getFullYear(),
        quarter: currentQuarter,
      };

      this.generatePerformanceData();
    },

    formatPeriod(period) {
      if (!period) return '';

      switch (period.type) {
        case 'quarter':
          return `${period.year}년 ${period.quarter}분기`;
        case 'half':
          return `${period.year}년 ${period.half === '1' ? '상' : '하'}반기`;
        case 'year':
          return `${period.year}년`;
        case 'custom':
          return `${period.startDate} ~ ${period.endDate}`;
        default:
          return '';
      }
    },

    applyPeriod() {
      let newPeriod = { type: this.tempPeriodType };

      switch (this.tempPeriodType) {
        case 'quarter':
          newPeriod.year = this.tempYear;
          newPeriod.quarter = this.tempQuarter;
          break;
        case 'half':
          newPeriod.year = this.tempYear;
          newPeriod.half = this.tempHalf;
          break;
        case 'year':
          newPeriod.year = this.tempYear;
          break;
        case 'custom':
          if (!this.tempStartDate || !this.tempEndDate) {
            if (typeof toast !== 'undefined') {
              toast.warn('시작일과 종료일을 모두 선택해주세요.');
            }
            return;
          }
          newPeriod.startDate = this.tempStartDate;
          newPeriod.endDate = this.tempEndDate;
          break;
      }

      this.selectedPeriod = newPeriod;
      this.generatePerformanceData();
      this.closeModal();
    },

    generatePerformanceData() {
      // 더미 성과 데이터 생성 (실제로는 API에서 가져옴)
      const baseScore = Math.random() * 3 + 7; // 7-10 사이
      const projects = Math.floor(Math.random() * 5) + 1; // 1-5개
      const achievement = Math.floor(Math.random() * 30) + 70; // 70-100%

      let grade = 'C';
      if (baseScore >= 9) grade = 'S';
      else if (baseScore >= 8.5) grade = 'A';
      else if (baseScore >= 8) grade = 'B+';
      else if (baseScore >= 7.5) grade = 'B';

      this.performanceData = {
        completedProjects: projects,
        averageScore: baseScore.toFixed(1),
        grade: grade,
        achievementRate: achievement,
      };
    },

    getGradeClass(grade) {
      const gradeClasses = {
        S: 'grade-s',
        A: 'grade-a',
        'B+': 'grade-b-plus',
        B: 'grade-b',
        C: 'grade-c',
      };
      return gradeClasses[grade] || '';
    },

    generateReport() {
      if (!this.selectedPeriod) return;

      const reportData = {
        employee: this.employee,
        period: this.selectedPeriod,
        performance: this.performanceData,
      };

      this.$emit('generate-report', reportData);

      // 임시로 알림 표시
      if (typeof toast !== 'undefined') {
        toast.warn(`${this.employee.name}의 ${this.formatPeriod(this.selectedPeriod)} 성과 리포트가 생성되었습니다.`);
      }
    },

    closeModal() {
      this.showPeriodModal = false;
    },
  },
};
</script>

<style scoped>
.period-selector-container {
  margin-bottom: 30px;
}

.period-header {
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

.period-controls {
  display: flex;
  gap: 10px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}

.current-period {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.period-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.period-label {
  font-weight: 600;
  color: #6c757d;
}

.period-value {
  font-weight: 600;
  color: #007bff;
  background: white;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid #e9ecef;
}

.performance-summary {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.summary-item {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.summary-label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  color: #343a40;
}

.grade-s {
  color: #dc3545;
}
.grade-a {
  color: #fd7e14;
}
.grade-b-plus {
  color: #ffc107;
}
.grade-b {
  color: #28a745;
}
.grade-c {
  color: #6c757d;
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

.period-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.period-option label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  cursor: pointer;
  padding: 10px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.period-option label:hover {
  background-color: #f8f9fa;
}

.period-option input[type='radio'] {
  margin: 0;
}

.period-details {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-group label {
  font-weight: 600;
  color: #343a40;
}

.input-group select,
.input-group input {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.input-group select:focus,
.input-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
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
  .period-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .period-controls {
    justify-content: center;
  }

  .summary-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  }

  .summary-item {
    padding: 12px;
  }

  .summary-value {
    font-size: 20px;
  }

  .modal-content {
    width: 95%;
    margin: 10px;
  }

  .period-details {
    padding: 15px;
  }
}
</style>
