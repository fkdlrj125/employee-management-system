<template>
  <div>
    <table class="info-table" id="projectTable">
      <thead>
        <tr>
          <th class="project-period-th">기간</th>
          <th class="project-name-th">프로젝트명</th>
          <th class="project-client-th">고객사</th>
          <th class="project-role-th">역할</th>
          <th class="project-tech-th">사용기술</th>
          <th class="project-desc-th">설명</th>
          <th class="manage-th" id="projectManageTh" style="width:70px;min-width:60px;">관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(project, index) in projects" :key="index">
          <td>
            <div class="period-inputs">
              <input 
                type="month" 
                class="project-start-date" 
                :disabled="!editMode"
                v-model="project.startDate"
                placeholder="시작일"
              >
              <span>~</span>
              <input 
                type="month" 
                class="project-end-date" 
                :disabled="!editMode"
                v-model="project.endDate"
                placeholder="종료일"
              >
            </div>
          </td>
          <td>
            <input 
              type="text" 
              class="project-name" 
              :disabled="!editMode"
              v-model="project.name"
            >
          </td>
          <td>
            <input 
              type="text" 
              class="project-client" 
              :disabled="!editMode"
              v-model="project.client"
            >
          </td>
          <td>
            <input 
              type="text" 
              class="project-role" 
              :disabled="!editMode"
              v-model="project.role"
            >
          </td>
          <td>
            <input 
              type="text" 
              class="project-tech" 
              :disabled="!editMode"
              v-model="project.technologies"
            >
          </td>
          <td>
            <textarea 
              class="project-desc" 
              :disabled="!editMode"
              v-model="project.description"
              rows="2"
            ></textarea>
          </td>
          <td class="manage-td move-btns-cell">
            <div class="manage-btns" v-if="editMode">
              <button type="button" class="move-up-btn" :disabled="index === 0" @click="moveUp(index)">▲</button>
              <button type="button" class="move-down-btn" :disabled="index === projects.length - 1" @click="moveDown(index)">▼</button>
              <button type="button" class="delete-btn" @click="deleteProject(index)">삭제</button>
            </div>
            <div class="manage-btns" v-else>
              <button type="button" class="move-up-btn" disabled>▲</button>
              <button type="button" class="move-down-btn" disabled>▼</button>
              <button type="button" class="delete-btn" disabled>삭제</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'ProjectTable',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    editMode: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    projects: {
      get() {
        return this.value || []
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },
  methods: {
    moveUp(index) {
      if (index > 0) {
        const projects = [...this.projects]
        const temp = projects[index]
        projects[index] = projects[index - 1]
        projects[index - 1] = temp
        this.projects = projects
      }
    },
    moveDown(index) {
      if (index < this.projects.length - 1) {
        const projects = [...this.projects]
        const temp = projects[index]
        projects[index] = projects[index + 1]
        projects[index + 1] = temp
        this.projects = projects
      }
    },
    deleteProject(index) {
      if (confirm('정말 삭제하시겠습니까?')) {
        this.projects = this.projects.filter((_, i) => i !== index)
      }
    }
  }
}
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
