<template>
  <div class="table-section">
    <h3>경력 사항 (2개월)</h3>
    <table class="info-table" id="careerTable">
      <thead>
        <tr>
          <th class="career-period-th">근무기간</th>
          <th class="career-company-th">회사명</th>
          <th class="career-position-th">직위</th>
          <th class="career-duties-th">담당업무</th>
          <th v-if="editMode" class="manage-th" style="width: 70px; min-width: 60px">관리</th>
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
              />
              <span>~</span>
              <input
                type="month"
                class="career-end-date"
                :disabled="!editMode"
                v-model="career.endDate"
                placeholder="종료일"
              />
            </div>
          </td>
          <td>
            <input
              type="text"
              class="career-company"
              :disabled="!editMode"
              v-model="career.company"
            />
          </td>
          <td>
            <input
              type="text"
              class="career-position"
              :disabled="!editMode"
              v-model="career.position"
            />
          </td>
          <td>
            <textarea
              class="career-duties"
              :disabled="!editMode"
              v-model="career.duties"
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
                :disabled="index === careers.length - 1"
                @click="moveDown(index)"
              >
                ▼
              </button>
              <button type="button" class="delete-btn" @click="deleteCareer(index)">삭제</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="editMode" class="button-container-right">
      <button
        type="button"
        class="btn btn-secondary add-career-row right-btn add-row-btn"
        @click="addCareer"
      >
        + 행 추가
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'CareerTable',
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

    return {
      careers,
      addCareer,
      moveUp,
      moveDown,
      deleteCareer,
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
