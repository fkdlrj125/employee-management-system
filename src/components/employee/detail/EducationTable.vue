<template>
  <div class="table-section">
    <h3>학력</h3>
    <table class="info-table" id="eduTable">
      <thead>
        <tr>
          <th class="info-label">기간</th>
          <th class="info-label">학교명</th>
          <th class="info-label">전공</th>
          <th v-if="editMode" class="manage-th">관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(education, index) in educations" :key="index">
          <td>
            <CommonInput
              :model-value="formatPeriod(education.startDate, education.endDate)"
              placeholder="클릭하여 기간 선택"
              input-class="info-input plain-input"
              :readonly="true"
              :disabled="!editMode"
              @click="editMode ? openPeriodPicker(index) : null"
              class="cursor-pointer"
            />
            <DateRangePicker
              v-if="periodModalVisible"
              :visible="periodModalVisible"
              :start="periodTemp.start"
              :end="periodTemp.end"
              type="month"
              @select="onPeriodSelect"
              @close="periodModalVisible = false"
            />
          </td>
          <td>
            <CommonInput
              v-model="education.school"
              input-class="info-input plain-input"
              :disabled="!editMode"
            />
          </td>
          <td>
            <CommonInput v-model="education.major" input-class="info-input plain-input" :disabled="!editMode" />
          </td>
          <td v-if="editMode" class="manage-td move-btns-cell">
            <div class="manage-btns">
              <Button type="button" btn-class="move-up-btn" :disabled="index === 0" @click="moveUp(index)">▲</Button>
              <Button type="button" btn-class="move-down-btn" :disabled="index === educations.length - 1" @click="moveDown(index)">▼</Button>
              <Button type="button" btn-class="delete-btn" @click="deleteEducation(index)">삭제</Button>
            </div>
          </td>
        </tr>
        <tr v-if="educations.length === 0">
          <td>
            <CommonInput
              placeholder="클릭하여 기간 선택"
              input-class="info-input plain-input"
              :readonly="true"
              :disabled="!editMode"
            />
          </td>
          <td>
            <CommonInput input-class="edu-school plain-input" :disabled="!editMode" />
            <CommonInput input-class="info-input plain-input" :disabled="!editMode" />
          </td>
          <td>
            <CommonInput input-class="edu-major plain-input" :disabled="!editMode" />
            <CommonInput input-class="info-input plain-input" :disabled="!editMode" />
          </td>
          <td v-if="editMode" class="manage-td move-btns-cell">
            <div class="manage-btns">
              <Button type="button" btn-class="move-up-btn" disabled>▲</Button>
              <Button type="button" btn-class="move-down-btn" disabled>▼</Button>
              <Button type="button" btn-class="delete-btn" disabled>삭제</Button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="editMode" class="button-container-right">
      <Button
        type="button"
        btn-class="btn btn-secondary add-edu-row right-btn add-row-btn"
        @click="addEducation"
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
  name: 'EducationTable',
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
    const educations = computed({
      get() {
        return props.employee?.educations || [];
      },
      set(value) {
        emit('update:employee', {
          ...props.employee,
          educations: value,
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
      const edu = educations.value[index];
      periodTemp.value = {
        start: edu.startDate || '',
        end: edu.endDate || '',
      };
      periodModalVisible.value = true;
    };

    const onPeriodSelect = ({ start, end }) => {
      if (selectedPeriodIndex.value < 0) return;
      const newList = [...educations.value];
      newList[selectedPeriodIndex.value] = {
        ...newList[selectedPeriodIndex.value],
        startDate: start,
        endDate: end,
      };
      educations.value = newList;
      periodModalVisible.value = false;
    };

    const addEducation = () => {
      const newEducation = {
        school: '',
        major: '',
        startDate: '',
        endDate: '',
      };
      educations.value = [...educations.value, newEducation];
    };

    const deleteEducation = (index) => {
      if (confirm('정말 삭제하시겠습니까?')) {
        educations.value = educations.value.filter((_, i) => i !== index);
      }
    };

    const moveUp = (index) => {
      if (index > 0) {
        const newEducations = [...educations.value];
        const temp = newEducations[index];
        newEducations[index] = newEducations[index - 1];
        newEducations[index - 1] = temp;
        educations.value = newEducations;
      }
    };

    const moveDown = (index) => {
      if (index < educations.value.length - 1) {
        const newEducations = [...educations.value];
        const temp = newEducations[index];
        newEducations[index] = newEducations[index + 1];
        newEducations[index + 1] = temp;
        educations.value = newEducations;
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
      educations,
      addEducation,
      deleteEducation,
      moveUp,
      moveDown,
      formatPeriod,
      openPeriodPicker,
      periodModalVisible,
      periodTemp,
      onPeriodSelect,
    };
  },
};
</script>

<style scoped>
</style>
