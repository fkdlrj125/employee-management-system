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
        <button @click="openModal" class="btn btn-secondary btn-sm">평가 입력</button>
      </div>
    </div>


    <div class="chart-wrapper">
      <canvas ref="chartCanvas" width="400" height="400"></canvas>
    </div>
    <div class="chart-bottom-controls" v-if="false">
      <button
        class="btn btn-secondary btn-sm"
        @click="$emit('go-to-period-analysis')"
      >
        기간별 기술 역량 분석
      </button>
    </div>

    <!-- 차트 아래, 버튼 아래에 항상 보이는 비고 영역 -->
    <div class="special-note-display">
      <label class="special-note-label">비고</label>
      <div class="special-note-content">
        {{ latestSpecialNote ? latestSpecialNote : '비고 없음' }}
      </div>
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
              <label>{{ Array.isArray(skill.label) ? skill.label.join('') : skill.label }}</label>
              <div class="score-input">
                <input type="range" min="0" max="5" v-model="skill.score" class="skill-slider" />
                <span class="score-display">{{ skill.score }}/5</span>
              </div>
            </div>
          </div>
        <!-- 비고란 추가 -->
        <div class="special-note-group">
          <label for="specialNote" class="special-note-label">비고</label>
          <textarea id="specialNote" v-model="specialNote" rows="3" class="special-note-textarea"></textarea>
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
import { formatPeriod } from '@/utils/formatPeriod';
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
import evaluationApiService from '@/services/EvaluationApiService';

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
      specialNote: '',
      evaluationHistory: null, // 최신 평가 데이터만 관리
      isChartRendering: false, // 차트 렌더링 중 플래그
      chartUpdateQueue: [], // 차트 변경 요청 큐
    };
  },
  computed: {
    skillCategories() {
      return this.selectedRole === 'leader' ? this.leaderSkills : this.memberSkills;
    },
    // 최신 평가 데이터 반환
    currentEvaluation() {
      return this.evaluationHistory || null;
    },
    latestSpecialNote() {
      // 최신 평가의 special_note 추출 (배열/객체 모두 처리)
      const evalData = this.currentEvaluation;
      if (!evalData) return '';
      if (Array.isArray(evalData) && evalData.length > 0) {
        // 최신 날짜 기준으로 정렬 후 special_note 반환
        const latest = evalData[0].evaluation_date
          ? [...evalData].sort((a, b) => new Date(b.evaluation_date || 0) - new Date(a.evaluation_date || 0))[0]
          : evalData[0];
        return latest.special_note || '';
      }
      return evalData.special_note || '';
    }
  },
  watch: {
    'employee.skillScores': {
      handler(newVal, oldVal) {
        if (this.selectedRole === 'member' && JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
          this.loadSkillData();
          // updateChart() 중복 호출 방지 위해 제거
        }
      },
      deep: false,
      immediate: false,
    },
    'employee.leaderSkillScores': {
      handler(newVal, oldVal) {
        if (this.selectedRole === 'leader' && JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
          this.loadSkillData();
          // updateChart() 중복 호출 방지 위해 제거
        }
      },
      deep: false,
      immediate: false,
    },
    async selectedRole() {
      // 역할 변경 시 해당 평가 이력 API 호출
      if (this.employee && this.employee.id) {
        let evaluation = null;
        if (this.selectedRole === 'leader') {
          evaluation = await evaluationApiService.getLeaderEvaluationHistory(this.employee.id);
        } else {
          evaluation = await evaluationApiService.getEvaluationHistory(this.employee.id);
        }
        // Proxy/reactive 객체를 순수 객체로 변환
        evaluation = evaluation ? JSON.parse(JSON.stringify(evaluation)) : null;
        this.evaluationHistory = evaluation;
        this.setSkillScoresFromHistory();
      }
      this.loadSkillData();
      this.updateChart(); // 역할 변경 후 차트 갱신
      // 중복 갱신 방지: updateChart() 직접 호출 제거
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
  async mounted() {
    // employee.id로 평가 이력 직접 조회
    if (this.employee && this.employee.id) {
      try {
        let evaluation = await evaluationApiService.getEvaluationHistory(this.employee.id);
        evaluation = evaluation ? JSON.parse(JSON.stringify(evaluation)) : null;
        this.evaluationHistory = evaluation;
        this.setSkillScoresFromHistory();
        this.loadSkillData();
        this.initChart();
        this.initHistoryChart();
      } catch (e) {
        this.evaluationHistory = null;
        this.setSkillScoresFromHistory();
        this.loadSkillData();
        this.initChart();
        this.initHistoryChart();
      }
    } else {
      this.setSkillScoresFromHistory();
      this.loadSkillData();
      this.initChart();
      this.initHistoryChart();
    }
    setTimeout(() => {
      this.firstMount = false;
    }, 700);
  },
      
  beforeUnmount() {
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
      // 역할 변경 시 specialNote도 최신 평가 special_note로 초기화
      if (Array.isArray(this.evaluationHistory) && this.evaluationHistory.length > 0) {
        const latest = this.evaluationHistory[0].evaluation_date
          ? [...this.evaluationHistory].sort((a, b) => new Date(b.evaluation_date || 0) - new Date(a.evaluation_date || 0))[0]
          : this.evaluationHistory[0];
        const pureLatest = JSON.parse(JSON.stringify(latest));
        this.specialNote = pureLatest.special_note || '';
      }
    },

     // 평가 이력에서 최신 점수 employee에 세팅
    setSkillScoresFromHistory() {
      // 최신 평가 데이터에서 점수 추출
      let evaluation = this.currentEvaluation;
      // 평가 데이터가 배열로 올 경우 첫 번째 객체만 사용
      if (Array.isArray(evaluation) && evaluation.length > 0) {
        evaluation = evaluation[0];
      }
      if (!this.employee || !evaluation) return;

      function makeScores(obj, prefix) {
        if (!obj) return [0,0,0,0,0,0];
        return [1,2,3,4,5,6].map(i => Number(obj[`${prefix}${i}`]) || 0);
      }

      let memberScores = [0,0,0,0,0,0];
      let leaderScores = [0,0,0,0,0,0];
      if (this.selectedRole === 'member') {
        memberScores = makeScores(evaluation, 'score');
      } else {
        leaderScores = makeScores(evaluation, 'score');
      }

      this.employee.skillScores = memberScores;
      this.employee.leaderSkillScores = leaderScores;
      this.memberSkills.forEach((category, idx) => { category.score = memberScores[idx]; });
      this.leaderSkills.forEach((category, idx) => { category.score = leaderScores[idx]; });

      this.loadSkillData();
    },

    loadSkillData() {
      // 이미 세팅된 memberSkills/leaderSkills의 score만 화면에 반영
      const arr = this.selectedRole === 'leader' ? this.leaderSkills : this.memberSkills;
      arr.forEach((category) => {
        // score 값이 undefined/null이면 0으로 보정
        category.score = typeof category.score === 'number' && !isNaN(category.score) ? category.score : 0;
        // labelStr 변수 제거 (실제 사용되지 않음)
      });
    },

    initChart() {
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      const canvas = this.$refs.chartCanvas;
      if (!canvas || !(canvas instanceof HTMLCanvasElement)) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      // 데이터 변환 및 차트 생성
      const skillCategoriesCopy = JSON.parse(JSON.stringify(this.skillCategories || []));
      const labels = skillCategoriesCopy.map(skill => Array.isArray(skill.label) ? skill.label.join('') : String(skill.label));
      let safeScores = skillCategoriesCopy.map(skill => {
        const n = parseInt(skill.score, 10);
        return isNaN(n) ? 0 : n;
      });
      if (safeScores.length < 6) safeScores = [...safeScores, ...Array(6 - safeScores.length).fill(0)];
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
      ];
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
        filler: false,
      };
      this.chart = new Chart(ctx, {
        type: 'radar',
        data: { labels, datasets },
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
              grid: { color: '#e0e0e0' },
              pointLabels: {
                font: { size: 12 },
                color: '#333',
              },
            },
          },
          plugins: {
            ...plugins,
            filler: false,
          },
          animation: {
            onComplete: () => {
              this.isChartRendering = false;
              if (this.chartUpdateQueue.length > 0) {
                const next = this.chartUpdateQueue.shift();
                if (typeof next === 'function') next();
              }
            },
          },
        },
      });
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
      if (this.isChartRendering) {
        this.chartUpdateQueue.push(() => this.updateChart());
        return;
      }
      this.isChartRendering = true;
      try {
        if (this.chart) {
          this.chart.destroy();
          this.chart = null;
        }
        this.chartKey++;
        this.$nextTick(() => {
          this.initChart();
        });
      } catch (e) {
        this.isChartRendering = false;
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
      const now = new Date();
      payload.evaluation_date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-01`;
      payload.special_note = this.specialNote;
      const user = this.$store.getters['auth/authUser'] || this.$store.getters['auth/currentUser'];
      if (user && user.id) {
        payload.evaluated_by = user.id;
      }
      let res;
      try {
        if (this.selectedRole === 'leader') {
          payload.leaderSkillScores = scores;
          // 리더 평가 저장 API 호출 (/evaluations/leader/:id)
          res = await evaluationApiService.saveLeaderSkillScores(this.employee.id, payload);
        } else {
          payload.skillScores = scores;
          // 멤버 평가 저장 API 호출 (/evaluations/:id)
          res = await evaluationApiService.saveSkillScores(this.employee.id, payload);
        }
        if (res && res.success) {
          // 평가 이력 재조회 및 점수 갱신
          if (this.employee && this.employee.id) {
            const id = this.employee.id;
            // 저장 후 약간의 딜레이를 추가하여 백엔드 반영을 기다림
            await new Promise(resolve => setTimeout(resolve, 350));
            let history;
            if (this.selectedRole === 'leader') {
              history = await evaluationApiService.getLeaderEvaluationHistory(id);
            } else {
              history = await evaluationApiService.getEvaluationHistory(id);
            }
            this.evaluationHistory = Array.isArray(history) ? history : [];
            this.setSkillScoresFromHistory();
            this.updateChart();
          } else {
            this.setSkillScoresFromHistory();
            this.updateChart();
          }
          this.specialNote = '';
          this.closeModal();
        } else {
          if (typeof toast !== 'undefined') {
            toast.error(res.error || '저장에 실패했습니다.');
          }
        }
      } catch (e) {
        if (typeof toast !== 'undefined') {
          toast.error('저장 중 오류가 발생했습니다.');
        }
        this.setSkillScoresFromHistory();
        this.updateChart();
      }
    },

    closeModal() {
      this.showSkillModal = false;
    },
    // 모달 열릴 때 specialNote를 최신 평가 special_note로 초기화
    openModal() {
      if (Array.isArray(this.evaluationHistory) && this.evaluationHistory.length > 0) {
        const latest = this.evaluationHistory[0].evaluation_date
          ? [...this.evaluationHistory].sort((a, b) => new Date(b.evaluation_date || 0) - new Date(a.evaluation_date || 0))[0]
          : this.evaluationHistory[0];
        const pureLatest = JSON.parse(JSON.stringify(latest));
        this.specialNote = pureLatest.special_note || '';
      } else {
        this.specialNote = '';
      }
      this.showSkillModal = true;
    },
     
  },
};
</script>

<style scoped>
/* 하단 버튼 우측 정렬 */
.chart-bottom-controls {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

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

/* 최근 평가 비고 라벨 밑줄 스타일 명확히 추가 (모든 화면에서 적용) */
.special-note-label {
  font-weight: 600;
  color: #343a40;
  font-size: 18px;
  padding-bottom: 8px;
  border-bottom: 2px solid #007bff;
  display: inline-block;
  margin-bottom: 8px;
}

.special-note-group, .special-note-display {
  margin-top: 24px;
}

.special-note-content {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  white-space: pre-line;
  min-height: 56px;
  font-size: 15px;
  color: #222;
  margin-top: 4px;
}

.special-note-textarea {
  width: 100%;
  resize: none; /* 크기 조절 불가 */
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  font-size: 15px;
  background: #f8f9fa;
  color: #222;
  min-height: 56px;
  box-sizing: border-box;
  margin-top: 6px;
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
  max-height: 95vh;
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
