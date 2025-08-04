<template>
  <div>
    <table class="info-table" id="certTable">
      <thead>
        <tr>
          <th class="cert-date-th">발급일</th>
          <th class="cert-name-th">자격증명</th>
          <th class="cert-issuer-th">발급처</th>
          <th class="manage-th" id="certManageTh" style="width:70px;min-width:60px;">관리</th>
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
            >
          </td>
          <td>
            <input 
              type="text" 
              class="cert-name" 
              :disabled="!editMode"
              v-model="certificate.name"
            >
          </td>
          <td>
            <input 
              type="text" 
              class="cert-issuer" 
              :disabled="!editMode"
              v-model="certificate.issuer"
            >
          </td>
          <td class="manage-td move-btns-cell">
            <div class="manage-btns" v-if="editMode">
              <button type="button" class="move-up-btn" :disabled="index === 0" @click="moveUp(index)">▲</button>
              <button type="button" class="move-down-btn" :disabled="index === certificates.length - 1" @click="moveDown(index)">▼</button>
              <button type="button" class="delete-btn" @click="deleteCertificate(index)">삭제</button>
            </div>
            <div class="manage-btns" v-else>
              <button type="button" class="move-up-btn" disabled>▲</button>
              <button type="button" class="move-down-btn" disabled>▼</button>
              <button type="button" class="delete-btn" disabled>삭제</button>
            </div>
          </td>
        </tr>
        <tr v-if="certificates.length === 0">
          <td>
            <input 
              type="month" 
              class="cert-date" 
              :disabled="!editMode"
            >
          </td>
          <td>
            <input 
              type="text" 
              class="cert-name" 
              :disabled="!editMode"
            >
          </td>
          <td>
            <input 
              type="text" 
              class="cert-issuer" 
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
        class="btn btn-secondary add-cert-row right-btn add-row-btn" 
        :disabled="!editMode"
        @click="addCertificate"
      >
        + 행 추가
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CertificateTable',
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
    certificates: {
      get() {
        return this.value || []
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },
  methods: {
    addCertificate() {
      const newCertificate = {
        name: '',
        issuer: '',
        issueDate: ''
      }
      this.certificates = [...this.certificates, newCertificate]
    },
    deleteCertificate(index) {
      if (confirm('정말 삭제하시겠습니까?')) {
        this.certificates = this.certificates.filter((_, i) => i !== index)
      }
    },
    moveUp(index) {
      if (index > 0) {
        const newCertificates = [...this.certificates]
        const temp = newCertificates[index]
        newCertificates[index] = newCertificates[index - 1]
        newCertificates[index - 1] = temp
        this.certificates = newCertificates
      }
    },
    moveDown(index) {
      if (index < this.certificates.length - 1) {
        const newCertificates = [...this.certificates]
        const temp = newCertificates[index]
        newCertificates[index] = newCertificates[index + 1]
        newCertificates[index + 1] = temp
        this.certificates = newCertificates
      }
    }
  }
}
</script>

<style scoped>
/* 컴포넌트별 스타일은 main.css에서 관리 */
</style>
