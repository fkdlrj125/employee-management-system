<template>
  <div class="table-section">
    <h3>대외경력</h3>
    <table class="info-table" id="projectTable">
      <thead>
        <tr>
          <th class="project-period-th">참여기간</th>
          <th class="project-name-th">경력명</th>
          <th class="project-desc-th">경력 내용</th>
          <th v-if="editMode" class="manage-th" style="width: 70px; min-width: 60px">관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(project, index) in projects" :key="index">
          <td>
            <input
              type="text"
              class="project-period"
              :disabled="!editMode"
              v-model="project.period"
              placeholder="예: 2025.06"
            />
          </td>
          <td>
            <input type="text" class="project-name" :disabled="!editMode" v-model="project.name" />
          </td>
          <td>
            <textarea
              class="project-desc"
              :disabled="!editMode"
              v-model="project.description"
              rows="2"
            ></textarea>
          </td>
          <td v-if="editMode" class="manage-td move-btns-cell">
            <div class="manage-btns">
              <button
                type="button"
                class="move-up-btn"
                :disabled="index === 0"
                @click="moveUp(index)"
              >
                ▲
              </button>
              <button
                type="button"
                class="move-down-btn"
                :disabled="index === projects.length - 1"
                @click="moveDown(index)"
              >
                ▼
              </button>
              <button type="button" class="delete-btn" @click="deleteProject(index)">삭제</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="editMode" class="button-container-right">
      <button
        type="button"
        class="btn btn-secondary add-project-row right-btn add-row-btn"
        @click="addProject"
      >
        + 행 추가
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'ProjectTable',
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

    const addProject = () => {
      const newProject = {
        period: '',
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

    return {
      projects,
      addProject,
      moveUp,
      moveDown,
      deleteProject,
    };
  },
};
</script>

<style scoped>
/* 기존 HTML 구조에 맞는 스타일은 main.css에서 관리 */
.period-inputs {
  display: flex;
  align-items: center;
  gap: 5px;
}

.period-inputs input {
  flex: 1;
  min-width: 100px;
}

.period-inputs span {
  margin: 0 5px;
}
</style>
