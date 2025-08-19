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
import { useTableRows } from '@/composables/useTableRows';
import { handleEmptyRowClick } from '@/utils/emptyRowAction';
import { DEFAULT_EDUCATION_ROW } from '@/utils/defaultTableRows';
import { formatPeriod } from '@/utils/formatPeriod';
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
    // 에러 메시지 렌더링 공통 함수
    function getError(key) {
      return props.errors && props.errors[key] ? props.errors[key] : '';
    }
    // computed get/set 방식으로 employee.educations와 연결
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

    // useTableRows 훅 사용
    const {
      rows,
      addRow,
      showDeleteConfirm,
      confirmDelete,
      moveUp,
      moveDown,
      toastConfirmVisible,
      deleteIndex,
    } = useTableRows(educations.value);

    // 행 추가 이벤트 emit
    function addEducationRow() {
      const newRow = {
        ...DEFAULT_EDUCATION_ROW,
        id: Date.now() + Math.random(),
      };
      addRow(newRow);
      emit('row-add', newRow);
    }

    // 행 삭제 이벤트 emit
    function confirmDeleteWithEmit() {
      if (deleteIndex.value !== -1) {
        emit('row-delete', deleteIndex.value);
      }
      confirmDelete();
    }

    // 행 이동 이벤트 emit
    function moveUpWithEmit(index) {
      if (index > 0) {
        emit('row-move', { from: index, to: index - 1 });
      }
      moveUp(index);
    }
    function moveDownWithEmit(index) {
      if (index < rows.value.length - 1) {
        emit('row-move', { from: index, to: index + 1 });
      }
      moveDown(index);
    }

    // rows와 employee.educations 동기화
    watch(rows, (newRows) => {
      educations.value = newRows;
    }, { deep: true });

    // employee.educations가 비어 있으면 자동으로 빈 행 추가
    watch(() => props.employee.educations, (newVal) => {
      if (Array.isArray(newVal) && newVal.length === 0) {
        addRow({
          ...DEFAULT_EDUCATION_ROW,
          id: Date.now() + Math.random(),
        });
      }
    }, { deep: true, immediate: true });

    // 기간 선택 모달 상태
    const periodModalVisible = ref(false);
    const periodTemp = ref({ start: '', end: '' });
    const selectedPeriodIndex = ref(-1);

    function openPeriodPicker(index) {
      if (!props.editMode) return;
      const edu = rows.value[index];
      periodTemp.value = {
        start: edu.period_start || '',
        end: edu.period_end || '',
      };
      selectedPeriodIndex.value = index;
      periodModalVisible.value = true;
    }

    function onPeriodSelect({ start, end }) {
      if (selectedPeriodIndex.value < 0) return;
      const newList = [...rows.value];
      newList[selectedPeriodIndex.value] = {
        ...newList[selectedPeriodIndex.value],
        period_start: start,
        period_end: end,
      };
      rows.value = newList;
      periodModalVisible.value = false;
    }


    // 빈 행에서 기간 클릭 시: 공통 유틸 사용
    const handleEmptyPeriodClick = () => {
      handleEmptyRowClick(() => addRow({
        ...DEFAULT_EDUCATION_ROW,
        id: Date.now() + Math.random(),
      }), openPeriodPicker);
    };

    const firstMount = ref(true);

    return {
      educations: rows,
      addEducation: addEducationRow,
      showDeleteConfirm,
      confirmDelete: confirmDeleteWithEmit,
      toastConfirmVisible,
      deleteIndex,
      moveUp: moveUpWithEmit,
      moveDown: moveDownWithEmit,
      formatPeriod,
      openPeriodPicker,
      periodModalVisible,
      periodTemp,
      selectedPeriodIndex,
      onPeriodSelect,
      firstMount,
      handleEmptyPeriodClick,
      getError,
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
