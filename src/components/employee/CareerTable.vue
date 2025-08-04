<template>
  <div>
    <table class="info-table" id="careerTable">
      <thead>
        <tr>
          <th class="career-period-th">기간</th>
          <th class="career-company-th">회사명</th>
          <th class="career-dept-th">부서</th>
          <th class="career-position-th">직책</th>
          <th class="career-duties-th">담당업무</th>
          <th class="manage-th" id="careerManageTh" style="width:70px;min-width:60px;">관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(career, index) in careers" :key="index">
          <td>
            <div class="period-inputs">
              <input 
                type="month" 
                class="career-start-date" 
                :disabled="!editMode"
                v-model="career.startDate"
                placeholder="시작일"
              >
              <span>~</span>
              <input 
                type="month" 
                class="career-end-date" 
                :disabled="!editMode"
                v-model="career.endDate"
                placeholder="종료일"
              >
            </div>
          </td>
          <td>
            <input 
              type="text" 
              class="career-company" 
              :disabled="!editMode"
              v-model="career.company"
            >
          </td>
          <td>
            <input 
              type="text" 
              class="career-dept" 
              :disabled="!editMode"
              v-model="career.department"
            >
          </td>
          <td>
            <input 
              type="text" 
              class="career-position" 
              :disabled="!editMode"
              v-model="career.position"
            >
          </td>
          <td>
            <textarea 
              class="career-duties" 
              :disabled="!editMode"
              v-model="career.duties"
              rows="2"
            ></textarea>
          </td>
          <td class="manage-td move-btns-cell">
            <div class="manage-btns" v-if="editMode">
              <button type="button" class="move-up-btn" :disabled="index === 0" @click="moveUp(index)">▲</button>
              <button type="button" class="move-down-btn" :disabled="index === careers.length - 1" @click="moveDown(index)">▼</button>
              <button type="button" class="delete-btn" @click="deleteCareer(index)">삭제</button>
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
  name: 'CareerTable',
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
    careers: {
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
        const careers = [...this.careers]
        const temp = careers[index]
        careers[index] = careers[index - 1]
        careers[index - 1] = temp
        this.careers = careers
      }
    },
    moveDown(index) {
      if (index < this.careers.length - 1) {
        const careers = [...this.careers]
        const temp = careers[index]
        careers[index] = careers[index + 1]
        careers[index + 1] = temp
        this.careers = careers
      }
    },
    deleteCareer(index) {
      if (confirm('정말 삭제하시겠습니까?')) {
        this.careers = this.careers.filter((_, i) => i !== index)
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
