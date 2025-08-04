<template>
  <div>
    <table class="info-table" id="eduTable">
      <thead>
        <tr>
          <th class="edu-period-th">기간</th>
          <th class="edu-school-th">학교명</th>
          <th class="edu-major-th">전공</th>
          <th class="manage-th" id="eduManageTh" style="width:70px;min-width:60px;">관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(education, index) in educations" :key="index">
          <td>
            <input 
              type="text" 
              class="edu-period" 
              placeholder="클릭하여 기간 선택" 
              readonly 
              :disabled="!editMode"
              :value="formatPeriod(education.startDate, education.endDate)"
              @click="openPeriodPicker(index)"
            >
          </td>
          <td>
            <input 
              type="text" 
              class="edu-school" 
              :disabled="!editMode"
              v-model="education.school"
            >
          </td>
          <td>
            <input 
              type="text" 
              class="edu-major" 
              :disabled="!editMode"
              v-model="education.major"
            >
          </td>
          <td class="manage-td move-btns-cell">
            <div class="manage-btns" v-if="editMode">
              <button type="button" class="move-up-btn" :disabled="index === 0" @click="moveUp(index)">▲</button>
              <button type="button" class="move-down-btn" :disabled="index === educations.length - 1" @click="moveDown(index)">▼</button>
              <button type="button" class="delete-btn" @click="deleteEducation(index)">삭제</button>
            </div>
            <div class="manage-btns" v-else>
              <button type="button" class="move-up-btn" disabled>▲</button>
              <button type="button" class="move-down-btn" disabled>▼</button>
              <button type="button" class="delete-btn" disabled>삭제</button>
            </div>
          </td>
        </tr>
        <tr v-if="educations.length === 0">
          <td>
            <input 
              type="text" 
              class="edu-period" 
              placeholder="클릭하여 기간 선택" 
              readonly 
              :disabled="!editMode"
            >
          </td>
          <td>
            <input 
              type="text" 
              class="edu-school" 
              :disabled="!editMode"
            >
          </td>
          <td>
            <input 
              type="text" 
              class="edu-major" 
              :disabled="!editMode"
            >
          </td>
          <td class="manage-td move-btns-cell">
            <div class="manage-btns">
              <button type="button" class="move-up-btn" disabled>▲</button>
              <button type="button" class="move-down-btn" disabled>▼</button>
              <button type="button" class="delete-btn" disabled>삭제</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="button-container-right">
      <button 
        type="button" 
        class="btn btn-secondary add-edu-row right-btn add-row-btn" 
        :disabled="!editMode"
        @click="addEducation"
      >
        + 행 추가
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EducationTable',
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
    educations: {
      get() {
        return this.value || []
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },
  methods: {
    addEducation() {
      const newEducation = {
        school: '',
        major: '',
        startDate: '',
        endDate: ''
      }
      this.educations = [...this.educations, newEducation]
    },
    deleteEducation(index) {
      if (confirm('정말 삭제하시겠습니까?')) {
        this.educations = this.educations.filter((_, i) => i !== index)
      }
    },
    moveUp(index) {
      if (index > 0) {
        const newEducations = [...this.educations]
        const temp = newEducations[index]
        newEducations[index] = newEducations[index - 1]
        newEducations[index - 1] = temp
        this.educations = newEducations
      }
    },
    moveDown(index) {
      if (index < this.educations.length - 1) {
        const newEducations = [...this.educations]
        const temp = newEducations[index]
        newEducations[index] = newEducations[index + 1]
        newEducations[index + 1] = temp
        this.educations = newEducations
      }
    },
    formatPeriod(startDate, endDate) {
      if (!startDate || !endDate) return ''
      const start = new Date(startDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit' })
      const end = new Date(endDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit' })
      return `${start} ~ ${end}`
    },
    openPeriodPicker(index) {
      // 기간 선택 모달 열기 (추후 구현)
      console.log('기간 선택 모달 열기:', index)
    }
  }
}
</script>

<style scoped>
/* 컴포넌트별 스타일은 main.css에서 관리 */
</style>
