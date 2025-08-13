<template>
  <div class="table-section" :class="{ 'with-anim': firstMount }">
    <div class="section-title">
      <h4>경력 사항 (2개월)</h4>
      <div v-if="editMode" class="add-btn-wrapper">
        <Button
          type="button"
          btn-class="btn btn-secondary add-career-row add-row-btn"
          @click="addCareer"
        >
          + 행 추가
        </Button>
      </div>
    </div>
    <table class="info-table" id="careerTable">
      <thead>
        <tr>
          <th class="info-label">근무기간</th>
          <th class="info-label">회사명</th>
          <th class="info-label">직위</th>
          <th class="info-label">담당업무</th>
          
        </tr>
      </thead>
      <tbody>
        <tr v-for="(career, index) in careers" :key="index" class="career-row">
          <td>
            <CommonInput
              :model-value="formatPeriod(career.startDate, career.endDate)"
              :input-attrs="{ placeholder: '클릭하여 기간 선택', readonly: true }"
              input-class="info-input plain-input"
              :disabled="!editMode"
              @click="editMode ? openPeriodPicker(index) : null"
              class="cursor-pointer"
            />
            <DateRangePicker
              v-if="periodModalVisible && selectedPeriodIndex === index"
              :visible="periodModalVisible"
              :start="periodTemp.start"
              :end="periodTemp.end"
              type="month"
              @select="onPeriodSelect"
              @close="periodModalVisible = false"
            />
            <div v-if="errors && errors[`career_${index}_startDate`]" class="error-message">{{ errors[`career_${index}_startDate`] }}</div>
            <div v-if="errors && errors[`career_${index}_endDate`]" class="error-message">{{ errors[`career_${index}_endDate`] }}</div>
          </td>
          <td>
            <CommonInput v-model="career.company_name" input-class="info-input plain-input" :disabled="!editMode" :input-attrs="{ placeholder: '회사명' }" />
            <div v-if="errors && errors[`career_${index}_company`]" class="error-message">{{ errors[`career_${index}_company`] }}</div>
          </td>
          <td>
            <CommonInput v-model="career.position" input-class="info-input plain-input" :disabled="!editMode" :input-attrs="{ placeholder: '직위' }" />
            <div v-if="errors && errors[`career_${index}_position`]" class="error-message">{{ errors[`career_${index}_position`] }}</div>
          </td>
          <td class="td-narrow" style="position:relative;">
            <textarea
              class="info-textarea plain-input"
              :disabled="!editMode"
              v-model="career.responsibilities"
              rows="2"
            ></textarea>
            <div v-if="errors && errors[`career_${index}_duties`]" class="error-message">{{ errors[`career_${index}_duties`] }}</div>
            <div v-if="editMode" class="row-action-btns action-btn-group">
              <button type="button" class="icon-btn" :disabled="index === 0" @click="moveUp(index)" title="위로 이동">
                <i class="fas fa-arrow-up"></i>
              </button>
              <button type="button" class="icon-btn" :disabled="index === careers.length - 1" @click="moveDown(index)" title="아래로 이동">
                <i class="fas fa-arrow-down"></i>
              </button>
              <button type="button" class="icon-btn" @click="showDeleteConfirm(index)" title="삭제">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="careers.length === 0">
          <td>
            <span
              class="info-input plain-input inline-block minw-110 cursor-pointer placeholder"
              @focus="editMode ? autoAddCareer() : null"
            >
              클릭하여 기간 선택
            </span>
          </td>
          <td>
            <CommonInput input-class="info-input plain-input" :disabled="!editMode" :input-attrs="{ placeholder: '회사명' }" @focus="editMode ? autoAddCareer() : null" />
          </td>
          <td>
            <CommonInput input-class="info-input plain-input" :disabled="!editMode" :input-attrs="{ placeholder: '직위' }" @focus="editMode ? autoAddCareer() : null" />
          </td>
          <td class="td-narrow" style="position:relative;">
            <textarea class="info-textarea plain-input" :disabled="!editMode" rows="2" @focus="editMode ? autoAddCareer() : null"></textarea>
            <div v-if="editMode" class="row-action-btns action-btn-group">
              <button type="button" class="icon-btn" disabled title="위로 이동">
                <i class="fas fa-arrow-up"></i>
              </button>
              <button type="button" class="icon-btn" disabled title="아래로 이동">
                <i class="fas fa-arrow-down"></i>
              </button>
              <button type="button" class="icon-btn delete" disabled title="삭제">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <ToastConfirm
      :visible="toastConfirmVisible"
      message="정말 삭제하시겠습니까?"
      @confirm="confirmDelete"
      @cancel="toastConfirmVisible = false"
    />
  </div>
</template>

<script>
import { computed, ref } from 'vue';
 import { handleEmptyRowClick } from '@/utils/empty-row-action';
import DateRangePicker from '@/components/common/DateRangePicker.vue';
import Button from '@/components/common/Button.vue';
import CommonInput from '@/components/common/CommonInput.vue';
import ToastConfirm from '@/components/common/ToastConfirm.vue';

export default {
  name: 'CareerTable',
  components: { DateRangePicker, Button, CommonInput, ToastConfirm },
  props: {
    employee: {
      type: Object,
      default: () => ({}),
    },
    editMode: {
      type: Boolean,
      default: false,
    },
    errors: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:employee'],
  setup(props, { emit }) {
    // 빈 행에서 입력 시 자동 행 추가
    const autoAddCareer = () => {
      if (props.editMode && (!props.employee.careers || props.employee.careers.length === 0)) {
        addCareer();
      }
    };
    const firstMount = ref(true);
    // ToastConfirm 삭제 관련 상태
    const toastConfirmVisible = ref(false);
    const deleteIndex = ref(-1);

    const showDeleteConfirm = (index) => {
      deleteIndex.value = index;
      toastConfirmVisible.value = true;
    };

    const confirmDelete = () => {
      if (deleteIndex.value !== -1) {
        careers.value = careers.value.filter((_, i) => i !== deleteIndex.value);
      }
      toastConfirmVisible.value = false;
      deleteIndex.value = -1;
    };

    const careers = computed({
      get() {
        return props.employee?.careers || [];
      },
      set(value) {
        emit('update:employee', {
          ...props.employee,
          careers: value,
        });
      },
    });

    // 기간 선택 모달 상태
    const periodModalVisible = ref(false);
    const periodTemp = ref({ start: '', end: '' });
    const selectedPeriodIndex = ref(-1);

    const openPeriodPicker = (index) => {
      if (!props.editMode) return;
      selectedPeriodIndex.value = index;
      const career = careers.value[index];
      periodTemp.value = {
        start: career.startDate || '',
        end: career.endDate || '',
      };
      periodModalVisible.value = true;
    };

    const addCareer = () => {
      const newCareer = {
        company_name: '',
        position: '',
        responsibilities: '',
        period_start: '',
        period_end: '',
      };
      careers.value = [...careers.value, newCareer];
    };

    const onPeriodSelect = ({ start, end }) => {
      if (selectedPeriodIndex.value < 0) return;
      const newList = [...careers.value];
      newList[selectedPeriodIndex.value] = {
        ...newList[selectedPeriodIndex.value],
        period_start: start,
        period_end: end,
      };
      emit('update:employee', {
        ...props.employee,
        careers: newList,
      });
      periodModalVisible.value = false;
    };

    const moveUp = (index) => {
      if (index > 0) {
        const newCareers = [...careers.value];
        const temp = newCareers[index];
        newCareers[index] = newCareers[index - 1];
        newCareers[index - 1] = temp;
        careers.value = newCareers;
      }
    };

    const moveDown = (index) => {
      if (index < careers.value.length - 1) {
        const newCareers = [...careers.value];
        const temp = newCareers[index];
        newCareers[index] = newCareers[index + 1];
        newCareers[index + 1] = temp;
        careers.value = newCareers;
      }
    };

    const formatPeriod = (startDate, endDate) => {
      if (!startDate && !endDate) return '';
      if (startDate && !endDate) {
        const start = new Date(startDate).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
        });
        return `${start} ~`;
      }
      if (!startDate && endDate) {
        const end = new Date(endDate).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
        });
        return `~ ${end}`;
      }
      const start = new Date(startDate).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
      });
      const end = new Date(endDate).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
      });
      return `${start} ~ ${end}`;
    };

    // 빈 행에서 기간 클릭 시: 공통 유틸 사용
    const handleEmptyPeriodClick = () => {
      handleEmptyRowClick(addCareer, openPeriodPicker);
    };

    setTimeout(() => { firstMount.value = false; }, 700);
    return {
      careers,
      addCareer,
      showDeleteConfirm,
      confirmDelete,
      toastConfirmVisible,
      deleteIndex,
      moveUp,
      moveDown,
      openPeriodPicker,
      periodModalVisible,
      periodTemp,
      selectedPeriodIndex,
      onPeriodSelect,
      formatPeriod,
      firstMount,
      handleEmptyPeriodClick, 
    };
  },
};
</script>

<style scoped>
.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 20px;
  font-weight: 700;
  color: #333;
  letter-spacing: -0.5px;
  gap: 8px;
}
.section-title h4 {
  border-bottom: 2px solid #007bff;
  padding-bottom: 8px;
  margin: 0;
}
@media (max-width: 900px) {
  .section-title {
    font-size: 15px;
    margin-bottom: 6px;
  }
  .section-title h4 {
    font-size: 15px;
    padding-bottom: 4px;
    border-bottom: 2px solid #007bff;
  }
}
@media (max-width: 600px) {
  .section-title {
    font-size: 13px;
    margin-bottom: 3px;
  }
  .section-title h4 {
    font-size: 13px;
    padding-bottom: 2px;
    border-bottom: 2px solid #007bff;
  }
}
@media (max-width: 900px) {
  .section-title {
    font-size: 15px;
    margin-bottom: 6px;
    padding-bottom: 4px;
  }
}
@media (max-width: 600px) {
  .section-title {
    font-size: 13px;
    margin-bottom: 3px;
    padding-bottom: 2px;
  }
}
.add-btn-wrapper {
  display: flex;
  align-items: center;
  margin-left: auto;
}
.add-row-btn {
  font-size: 15px;
  font-weight: 500;
  padding: 6px 18px;
  border-radius: 6px;
  margin-left: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: background 0.18s, color 0.18s;
}
.add-row-btn:hover {
  background: #e9ecef;
  color: #333;
}
.table-section {
  margin-bottom: 32px;
  min-height: unset;
  height: auto;
}
.info-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}
.info-table th, .info-table td {
  border: 1px solid #e0e0e0;
  padding: 8px 12px;
  text-align: left;
}
.info-table th {
  background: #f8f9fa;
  font-weight: 600;
}

/* 행 hover 시에만 아이콘 버튼 노출, overlay 스타일 */
.row-action-btns {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  display: flex;
  gap: 4px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s;
  z-index: 2;
}
.career-row:hover .row-action-btns {
  opacity: 1;
  pointer-events: auto;
}
.icon-btn {
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 2px 7px;
  font-size: 15px;
  color: #333;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  margin-left: 2px;
}
.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.icon-btn:hover:not(:disabled) {
  background: #f0f4fa;
  color: #007bff;
}
</style>
