<template>
  <div class="table-section" :class="{ 'with-anim': firstMount }">
    <div class="section-title">
      <h4>학력</h4>
      <div v-if="editMode" class="add-btn-wrapper">
        <Button
          type="button"
          btn-class="btn btn-secondary add-edu-row add-row-btn"
          @click="addEducation()"
        >
          + 행 추가
        </Button>
      </div>
    </div>
    <table class="info-table" id="eduTable">
      <thead>
        <tr>
          <th class="info-label">기간</th>
          <th class="info-label">학교명</th>
          <th class="info-label">전공</th>
          <!-- 관리 열 제거 -->
        </tr>
      </thead>
      <tbody>
        <tr v-for="(education, index) in educations" :key="education.id || index">
          <td>
            <CommonInput
              :model-value="formatPeriod(education.period_start, education.period_end)"
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
            <div v-if="errors && errors[`education_${index}_period_start`]" class="error-message">{{ errors[`education_${index}_period_start`] }}</div>
            <div v-if="errors && errors[`education_${index}_period_end`]" class="error-message">{{ errors[`education_${index}_period_end`] }}</div>
          </td>
          <td>
            <CommonInput
              v-model="education.school_name"
              input-class="info-input plain-input"
              :disabled="!editMode"
              :input-attrs="{ placeholder: '학교명' }"
            />
          </td>
          <td style="position:relative;">
            <CommonInput v-model="education.major" input-class="info-input plain-input" :disabled="!editMode" :input-attrs="{ placeholder: '전공' }" />
            <div v-if="editMode" class="row-action-btns action-btn-group">
              <Button type="button" btn-class="icon-btn" :disabled="index === 0" @click="moveUp(index)" :title="'위로 이동'">
                <i class="fa fa-arrow-up"></i>
              </Button>
              <Button type="button" btn-class="icon-btn" :disabled="index === educations.length - 1" @click="moveDown(index)" :title="'아래로 이동'">
                <i class="fa fa-arrow-down"></i>
              </Button>
              <Button type="button" btn-class="icon-btn delete" @click="showDeleteConfirm(index)" :title="'삭제'">
                <i class="fa fa-trash"></i>
              </Button>
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
import { computed, ref, watch } from 'vue';
import { handleEmptyRowClick } from '@/utils/emptyRowAction';
import DateRangePicker from '@/components/common/DateRangePicker.vue';
import Button from '@/components/common/Button.vue';
import CommonInput from '@/components/common/CommonInput.vue';
import ToastConfirm from '@/components/common/ToastConfirm.vue';

export default {
  name: 'EducationTable',
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
    // computed get/set 방식으로 변경
    const educations = computed({
      get() {
        return Array.isArray(props.employee?.educations) ? props.employee.educations : [];
      },
      set(value) {
        emit('update:employee', {
          ...props.employee,
          educations: value,
        });
      },
    });

    // 실제 데이터 배열에 빈 행 추가 함수
    const addEducation = () => {
      const newEducation = {
        id: Date.now() + Math.random(),
        school_name: '',
        major: '',
        period_start: '',
        period_end: '',
      };
      educations.value = [...educations.value, newEducation];
    };

    // employee.educations가 비어 있으면 자동으로 빈 행 추가
    watch(() => props.employee.educations, (newVal) => {
      if (Array.isArray(newVal) && newVal.length === 0) {
        addEducation();
      }
    }, { deep: true, immediate: true });

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
        educations.value = educations.value.filter((_, i) => i !== deleteIndex.value);
      }
      toastConfirmVisible.value = false;
      deleteIndex.value = -1;
    };

    // 기간 선택 모달 상태
    const periodModalVisible = ref(false);
    const periodTemp = ref({ start: '', end: '' });
    const selectedPeriodIndex = ref(-1);

    function openPeriodPicker(index) {
      console.log('[디버그] openPeriodPicker called', periodModalVisible, props.editMode);
      if (!props.editMode) return;
      const edu = educations.value[index];
      periodTemp.value = {
        start: edu.startDate || '',
        end: edu.endDate || '',
      };
      selectedPeriodIndex.value = index;
      periodModalVisible.value = true;
    }

    function onPeriodSelect({ start, end }) {
      if (selectedPeriodIndex.value < 0) return;
      const newList = [...educations.value];
      newList[selectedPeriodIndex.value] = {
        ...newList[selectedPeriodIndex.value],
        period_start: start,
        period_end: end,
      };
      emit('update:employee', {
        ...props.employee,
        educations: newList,
      });
      periodModalVisible.value = false;
    }
    const moveUp = (index) => {
      if (index > 0) {
        const newEducations = [...educations.value];
        [newEducations[index - 1], newEducations[index]] = [newEducations[index], newEducations[index - 1]];
        emitUpdateEmployee({
          ...props.employee,
          educations: newEducations,
        });
      }
    };

    const moveDown = (index) => {
      if (index < educations.value.length - 1) {
        const newEducations = [...educations.value];
        [newEducations[index], newEducations[index + 1]] = [newEducations[index + 1], newEducations[index]];
        emitUpdateEmployee({
          ...props.employee,
          educations: newEducations,
        });
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
    
    // 빈 행에서 기간 클릭 시: 공통 유틸 사용 (불필요한 setTimeout 제거)
    const handleEmptyPeriodClick = () => {
      handleEmptyRowClick(addEducation, openPeriodPicker);
    };

    // 첫 마운트 애니메이션 플래그
    // setTimeout 제거 (불필요한 애니메이션)
    return {
      educations,
      addEducation,
      showDeleteConfirm,
      confirmDelete,
      toastConfirmVisible,
      deleteIndex,
      moveUp,
      moveDown,
      formatPeriod,
      openPeriodPicker,
      periodModalVisible,
      periodTemp,
      selectedPeriodIndex,
      onPeriodSelect,
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
.manage-btns {
  display: flex;
  gap: 4px;
}

/* 아이콘 버튼 스타일 + 행 hover 시에만 노출, 마지막 셀 overlay */
.action-btn-group {
  display: flex;
  gap: 4px;
}
.info-table td {
  position: relative;
}
.row-action-btns {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.18s;
  z-index: 2;
}
tr:hover .row-action-btns {
  opacity: 1;
}
.icon-btn {
  background: #f5f6fa;
  border: none;
  border-radius: 6px;
  padding: 6px 8px;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
  font-size: 18px;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.icon-btn:hover:not(:disabled) {
  background: #e1e7ef;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  color: #1976d2;
  transform: translateY(-2px) scale(1.08);
}
.icon-btn.delete:hover:not(:disabled) {
  background: #ffeaea;
  color: #e53935;
}
</style>
