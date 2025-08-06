<template>
  <div class="table-section">
    <h3>학력</h3>
    <table class="info-table" id="eduTable">
      <thead>
        <tr>
          <th class="info-label">기간</th>
          <th class="info-label">학교명</th>
          <th class="info-label">전공</th>
          <th v-if="editMode" class="manage-th" style="width: 70px; min-width: 60px">관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(education, index) in educations" :key="index">
          <td>
            <input
              type="text"
              class="info-input plain-input"
              placeholder="클릭하여 기간 선택"
              readonly
              :disabled="!editMode"
              :value="formatPeriod(education.startDate, education.endDate)"
              @click="editMode ? openPeriodPicker(index) : null"
              style="cursor: pointer;"
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
            <input
              type="text"
              class="info-input plain-input"
              :disabled="!editMode"
              v-model="education.school"
            />
          </td>
          <td>
            <input type="text" class="info-input plain-input" :disabled="!editMode" v-model="education.major" />
          </td>
          <td v-if="editMode" class="manage-td move-btns-cell">
            <div class="manage-btns">
              <button
                type="button"
                class="move-up-btn"
                :disabled="index === 0"
                @click="moveUp(index)"
              >▲</button>
              <button
                type="button"
                class="move-down-btn"
                :disabled="index === educations.length - 1"
                @click="moveDown(index)"
              >▼</button>
              <button type="button" class="delete-btn" @click="deleteEducation(index)">삭제</button>
            </div>
          </td>
        </tr>
        <tr v-if="educations.length === 0">
          <td>
            <input
              type="text"
              class="info-input plain-input"
              placeholder="클릭하여 기간 선택"
              readonly
              :disabled="!editMode"
            />
          </td>
          <td>
            <input type="text" class="edu-school plain-input" :disabled="!editMode" />
            <input type="text" class="info-input plain-input" :disabled="!editMode" />
          </td>
          <td>
            <input type="text" class="edu-major plain-input" :disabled="!editMode" />
            <input type="text" class="info-input plain-input" :disabled="!editMode" />
          </td>
          <td v-if="editMode" class="manage-td move-btns-cell">
            <div class="manage-btns">
              <button type="button" class="move-up-btn" disabled>▲</button>
              <button type="button" class="move-down-btn" disabled>▼</button>
              <button type="button" class="delete-btn" disabled>삭제</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="editMode" class="button-container-right">
      <button
        type="button"
        class="btn btn-secondary add-edu-row right-btn add-row-btn"
        @click="addEducation"
      >
        + 행 추가
      </button>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import DateRangePicker from '../common/DateRangePicker.vue';

export default {
  name: 'EducationTable',
  components: { DateRangePicker },
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
@import '../../assets/css/common/plain-input.css';
@import '../../assets/css/common/tables.css';
</style>
