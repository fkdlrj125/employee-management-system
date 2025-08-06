<template>
  <div class="table-section">
    <h3>대외경력</h3>
    <table class="info-table" id="projectTable">
      <thead>
        <tr>
          <th class="info-label">참여기간</th>
          <th class="info-label">경력명</th>
          <th class="info-label">경력 내용</th>
          <th v-if="editMode" class="manage-th" style="width: 70px; min-width: 60px">관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(project, index) in projects" :key="index">
          <td>
            <CommonInput
              :model-value="formatPeriod(project.startDate, project.endDate)"
              placeholder="클릭하여 기간 선택"
              input-class="info-input plain-input"
              :readonly="true"
              :disabled="!editMode"
              @click="editMode ? openPeriodPicker(index) : null"
              style="cursor: pointer;"
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
            <CommonInput v-model="project.name" input-class="info-input plain-input" :disabled="!editMode" />
          </td>
          <td class="td-narrow">
            <textarea
              class="info-textarea plain-input"
              :disabled="!editMode"
              v-model="project.description"
              rows="2"
            ></textarea>
          </td>
          <td v-if="editMode" class="manage-td move-btns-cell">
            <div class="manage-btns">
              <Button type="button" btn-class="move-up-btn" :disabled="index === 0" @click="moveUp(index)">▲</Button>
              <Button type="button" btn-class="move-down-btn" :disabled="index === projects.length - 1" @click="moveDown(index)">▼</Button>
              <Button type="button" btn-class="delete-btn" @click="deleteProject(index)">삭제</Button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="editMode" class="button-container-right">
      <Button
        type="button"
        btn-class="btn btn-secondary add-project-row right-btn add-row-btn"
        @click="addProject"
      >
        + 행 추가
      </Button>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import DateRangePicker from '../common/DateRangePicker.vue';
import Button from '../common/Button.vue';
import CommonInput from '../common/CommonInput.vue';

export default {
  name: 'ProjectTable',
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
    const projects = computed({
      get() {
        return props.employee?.projects || [];
      },
      set(value) {
        emit('update:employee', {
          ...props.employee,
          projects: value,
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
      const project = projects.value[index];
      periodTemp.value = {
        start: project.startDate || '',
        end: project.endDate || '',
      };
      periodModalVisible.value = true;
    };

    const onPeriodSelect = ({ start, end }) => {
      if (selectedPeriodIndex.value < 0) return;
      const newList = [...projects.value];
      newList[selectedPeriodIndex.value] = {
        ...newList[selectedPeriodIndex.value],
        startDate: start,
        endDate: end,
      };
      projects.value = newList;
      periodModalVisible.value = false;
    };

    const addProject = () => {
      const newProject = {
        startDate: '',
        endDate: '',
        name: '',
        description: '',
      };
      projects.value = [...projects.value, newProject];
    };

    const moveUp = (index) => {
      if (index > 0) {
        const newProjects = [...projects.value];
        const temp = newProjects[index];
        newProjects[index] = newProjects[index - 1];
        newProjects[index - 1] = temp;
        projects.value = newProjects;
      }
    };

    const moveDown = (index) => {
      if (index < projects.value.length - 1) {
        const newProjects = [...projects.value];
        const temp = newProjects[index];
        newProjects[index] = newProjects[index + 1];
        newProjects[index + 1] = temp;
        projects.value = newProjects;
      }
    };

    const deleteProject = (index) => {
      if (confirm('정말 삭제하시겠습니까?')) {
        projects.value = projects.value.filter((_, i) => i !== index);
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
      projects,
      addProject,
      moveUp,
      moveDown,
      deleteProject,
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
@import '../../assets/css/common/plain-input.css';
@import '../../assets/css/common/tables.css';
</style>
