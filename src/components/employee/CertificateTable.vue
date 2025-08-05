<template>
  <div class="table-section">
    <h3>자격증</h3>
    <table class="info-table" id="certTable">
      <thead>
        <tr>
          <th class="cert-date-th">발급일</th>
          <th class="cert-name-th">자격증명</th>
          <th class="cert-issuer-th">발급처</th>
          <th v-if="editMode" class="manage-th" style="width: 70px; min-width: 60px">관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(certificate, index) in certificates" :key="index">
          <td>
            <input
              type="month"
              class="cert-date"
              :disabled="!editMode"
              v-model="certificate.issueDate"
            />
          </td>
          <td>
            <input type="text" class="cert-name" :disabled="!editMode" v-model="certificate.name" />
          </td>
          <td>
            <input
              type="text"
              class="cert-issuer"
              :disabled="!editMode"
              v-model="certificate.issuer"
            />
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
                :disabled="index === certificates.length - 1"
                @click="moveDown(index)"
              >
                ▼
              </button>
              <button type="button" class="delete-btn" @click="deleteCertificate(index)">
                삭제
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="certificates.length === 0">
          <td>
            <input type="month" class="cert-date" :disabled="!editMode" />
          </td>
          <td>
            <input type="text" class="cert-name" :disabled="!editMode" />
          </td>
          <td>
            <input type="text" class="cert-issuer" :disabled="!editMode" />
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
        class="btn btn-secondary add-cert-row right-btn add-row-btn"
        @click="addCertificate"
      >
        + 행 추가
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'CertificateTable',
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
    const certificates = computed({
      get() {
        return props.employee?.certificates || [];
      },
      set(value) {
        emit('update:employee', {
          ...props.employee,
          certificates: value,
        });
      },
    });

    const addCertificate = () => {
      const newCertificate = {
        name: '',
        issuer: '',
        issueDate: '',
      };
      certificates.value = [...certificates.value, newCertificate];
    };

    const deleteCertificate = (index) => {
      if (confirm('정말 삭제하시겠습니까?')) {
        certificates.value = certificates.value.filter((_, i) => i !== index);
      }
    };

    const moveUp = (index) => {
      if (index > 0) {
        const newCertificates = [...certificates.value];
        const temp = newCertificates[index];
        newCertificates[index] = newCertificates[index - 1];
        newCertificates[index - 1] = temp;
        certificates.value = newCertificates;
      }
    };

    const moveDown = (index) => {
      if (index < certificates.value.length - 1) {
        const newCertificates = [...certificates.value];
        const temp = newCertificates[index];
        newCertificates[index] = newCertificates[index + 1];
        newCertificates[index + 1] = temp;
        certificates.value = newCertificates;
      }
    };

    return {
      certificates,
      addCertificate,
      deleteCertificate,
      moveUp,
      moveDown,
    };
  },
};
</script>

<style scoped>
/* 컴포넌트별 스타일은 main.css에서 관리 */
</style>
