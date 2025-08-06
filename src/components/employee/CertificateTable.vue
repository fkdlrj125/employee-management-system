<template>
  <div class="table-section">
    <h3>자격증</h3>
    <table class="info-table" id="certTable">
      <thead>
        <tr>
          <th class="info-label">발급일</th>
          <th class="info-label">자격증명</th>
          <th class="info-label">발급처</th>
          <th v-if="editMode" class="manage-th" style="width: 70px; min-width: 60px">관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(certificate, index) in certificates" :key="index">
          <td class="td-narrow">
            <template v-if="editMode">
              <span
                v-if="activeMonthInput !== index"
                class="info-input plain-input"
                :class="{ placeholder: !certificate.issueDate }"
                @click="showMonthInput(index)"
                style="display:inline-block; min-width:110px; cursor:pointer;"
              >
                {{ certificate.issueDate ? formatIssueDate(certificate.issueDate) : '클릭하여 발급일 선택' }}
              </span>
              <DateInput
                v-else
                ref="monthInputs"
                type="month"
                input-class="info-input plain-input real-month-input"
                :model-value="certificate.issueDate"
                @update:modelValue="value => updateIssueDate(index, value)"
                @blur="hideMonthInput"
                style="min-width:110px;"
              />
            </template>
            <template v-else>
              <span
                class="info-input plain-input"
                :class="{ placeholder: !certificate.issueDate }"
              >
                {{ certificate.issueDate ? formatIssueDate(certificate.issueDate) : '클릭하여 발급일 선택' }}
              </span>
            </template>
          </td>
          <td>
            <CommonInput v-model="certificate.name" input-class="info-input plain-input" :disabled="!editMode" />
          </td>
          <td>
            <CommonInput v-model="certificate.issuer" input-class="info-input plain-input" :disabled="!editMode" />
          </td>
          <td v-if="editMode" class="manage-td move-btns-cell">
            <div class="manage-btns">
              <Button type="button" btn-class="move-up-btn" :disabled="index === 0" @click="moveUp(index)">▲</Button>
              <Button type="button" btn-class="move-down-btn" :disabled="index === certificates.length - 1" @click="moveDown(index)">▼</Button>
              <Button type="button" btn-class="delete-btn" @click="deleteCertificate(index)">삭제</Button>
            </div>
          </td>
        </tr>
        <tr v-if="certificates.length === 0">
          <td>
            <DateInput type="month" input-class="info-input plain-input" :disabled="!editMode" />
          </td>
          <td>
            <CommonInput input-class="info-input plain-input" :disabled="!editMode" />
          </td>
          <td>
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
        btn-class="btn btn-secondary add-cert-row right-btn add-row-btn"
        @click="addCertificate"
      >
        + 행 추가
      </Button>
    </div>
  </div>
</template>

<script>
import { computed, ref, nextTick } from 'vue';
import DateRangePicker from '../common/DateRangePicker.vue';
import Button from '../common/Button.vue';
import CommonInput from '../common/CommonInput.vue';
import DateInput from '../common/DateInput.vue';

export default {
  name: 'CertificateTable',
  components: { DateRangePicker, Button, CommonInput, DateInput },
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

    // 발급일 선택 모달 상태
    const issueDateModalVisible = ref(false);
    const issueDateTemp = ref('');
    const selectedIssueIndex = ref(-1);

    const openIssueDatePicker = (index) => {
      if (!props.editMode) return;
      selectedIssueIndex.value = index;
      const cert = certificates.value[index];
      issueDateTemp.value = cert.issueDate || '';
      issueDateModalVisible.value = true;
    };

    const onIssueDateSelect = ({ start }) => {
      if (selectedIssueIndex.value < 0) return;
      const newList = [...certificates.value];
      newList[selectedIssueIndex.value] = {
        ...newList[selectedIssueIndex.value],
        issueDate: start,
      };
      certificates.value = newList;
      issueDateModalVisible.value = false;
    };

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

    const formatIssueDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit' });
    };

    // 발급일(month) 변경 핸들러
    const updateIssueDate = (index, value) => {
      const newList = [...certificates.value];
      newList[index] = {
        ...newList[index],
        issueDate: value,
      };
      certificates.value = newList;
      hideMonthInput();
    };

    // month input show/hide 관리
    const activeMonthInput = ref(-1);
    const monthInputs = ref([]);
    const showMonthInput = (index) => {
      activeMonthInput.value = index;
      nextTick(() => {
        if (monthInputs.value && monthInputs.value[index]) {
          monthInputs.value[index].focus();
        }
      });
    };
    const hideMonthInput = () => {
      activeMonthInput.value = -1;
    };

    return {
      certificates,
      addCertificate,
      deleteCertificate,
      moveUp,
      moveDown,
      formatIssueDate,
      updateIssueDate,
      activeMonthInput,
      showMonthInput,
      hideMonthInput,
      monthInputs,
    };
  },
};
</script>

<style scoped>
@import '../../assets/css/common/plain-input.css';
@import '../../assets/css/common/tables.css';
</style>
