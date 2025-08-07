<template>
  <div class="table-section">
    <h3>경력 사항 (2개월)</h3>
    <table class="info-table" id="careerTable">
      <thead>
        <tr>
          <th class="info-label">근무기간</th>
          <th class="info-label">회사명</th>
          <th class="info-label">직위</th>
          <th class="info-label">담당업무</th>
          <th v-if="editMode" class="manage-th">관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(career, index) in careers" :key="index">
          <td>
            <CommonInput
              :model-value="formatPeriod(career.startDate, career.endDate)"
              placeholder="클릭하여 기간 선택"
              input-class="info-input plain-input"
              :readonly="true"
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
          </td>
          <td>
            <CommonInput v-model="career.company" input-class="info-input plain-input" :disabled="!editMode" />
          </td>
          <td>
            <CommonInput v-model="career.position" input-class="info-input plain-input" :disabled="!editMode" />
          </td>
          <td class="td-narrow">
            <textarea
              class="info-textarea plain-input"
              :disabled="!editMode"
              v-model="career.duties"
              rows="2"
            ></textarea>
          </td>
          <td v-if="editMode" class="manage-td move-btns-cell">
            <div class="manage-btns">
              <Button type="button" btn-class="move-up-btn" :disabled="index === 0" @click="moveUp(index)">▲</Button>
              <Button type="button" btn-class="move-down-btn" :disabled="index === careers.length - 1" @click="moveDown(index)">▼</Button>
              <Button type="button" btn-class="delete-btn" @click="deleteCareer(index)">삭제</Button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="editMode" class="button-container-right">
      <Button
        type="button"
        btn-class="btn btn-secondary add-career-row right-btn add-row-btn"
        @click="addCareer"
      >
        + 행 추가
      </Button>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import DateRangePicker from '@/components/common/DateRangePicker.vue';
import Button from '@/components/common/Button.vue';
import CommonInput from '@/components/common/CommonInput.vue';

export default {
  name: 'CareerTable',
  components: { DateRangePicker, Button, CommonInput },
  props: {
    employee: {
      type: Object,
      default: () => ({}),
    },
    editMode: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:employee'],
  setup(props, { emit }) {
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

    const onPeriodSelect = ({ start, end }) => {
      if (selectedPeriodIndex.value < 0) return;
      const newList = [...careers.value];
      newList[selectedPeriodIndex.value] = {
        ...newList[selectedPeriodIndex.value],
        startDate: start,
        endDate: end,
      };
      careers.value = newList;
      periodModalVisible.value = false;
    };

    const addCareer = () => {
      const newCareer = {
        company: '',
        position: '',
        duties: '',
        startDate: '',
        endDate: '',
      };
      careers.value = [...careers.value, newCareer];
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

    const deleteCareer = (index) => {
      if (confirm('정말 삭제하시겠습니까?')) {
        careers.value = careers.value.filter((_, i) => i !== index);
      }
    };

    const formatPeriod = (startDate, endDate) => {
      if (!startDate || !endDate) return '';
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

    return {
      careers,
      addCareer,
      moveUp,
      moveDown,
      deleteCareer,
      openPeriodPicker,
      periodModalVisible,
      periodTemp,
      selectedPeriodIndex,
      onPeriodSelect,
      formatPeriod,
    };
  },
};
</script>

<style scoped>
@import '@/assets/css/common/plain-input.css';
@import '@/assets/css/common/tables.css';
</style>
