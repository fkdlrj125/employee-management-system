<template>
  <div class="table-section" :class="{ 'with-anim': firstMount }">
    <div class="section-title">
      <h4>자격증</h4>
      <div v-if="editMode" class="add-btn-wrapper">
        <Button
          type="button"
          btn-class="btn btn-secondary add-cert-row add-row-btn"
          @click="addCertificate"
        >
          + 행 추가
        </Button>
      </div>
    </div>
    <table class="info-table" id="certTable">
      <thead>
        <tr>
          <th class="info-label">발급일</th>
          <th class="info-label">자격증명</th>
          <th class="info-label">발급처</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(certificate, index) in certificates" :key="index">
          <td class="td-narrow">
            <template v-if="editMode">
              <span
                v-if="activeMonthInput !== index"
                class="info-input plain-input inline-block minw-110 cursor-pointer"
                :class="{ placeholder: !certificate.issueDate }"
                @click="showMonthInput(index)"
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
                class="minw-110"
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
            <div v-if="errors && errors[`certificate_${index}_issueDate`]" class="error-message">{{ errors[`certificate_${index}_issueDate`] }}</div>
          </td>
          <td>
            <CommonInput v-model="certificate.name" input-class="info-input plain-input" :disabled="!editMode" :input-attrs="{ placeholder: '자격증명' }" />
            <div v-if="errors && errors[`certificate_${index}_name`]" class="error-message">{{ errors[`certificate_${index}_name`] }}</div>
          </td>
          <td style="position:relative;">
            <CommonInput v-model="certificate.issuer" input-class="info-input plain-input" :disabled="!editMode" :input-attrs="{ placeholder: '발급처' }" />
            <div v-if="errors && errors[`certificate_${index}_issuer`]" class="error-message">{{ errors[`certificate_${index}_issuer`] }}</div>
            <div v-if="editMode" class="row-action-btns action-btn-group">
              <Button type="button" btn-class="icon-btn" :disabled="index === 0" @click="moveUp(index)" :title="'위로 이동'">
                <i class="fa fa-arrow-up"></i>
              </Button>
              <Button type="button" btn-class="icon-btn" :disabled="index === certificates.length - 1" @click="moveDown(index)" :title="'아래로 이동'">
                <i class="fa fa-arrow-down"></i>
              </Button>
              <Button type="button" btn-class="icon-btn delete" @click="showDeleteConfirm(index)" :title="'삭제'">
                <i class="fa fa-trash"></i>
              </Button>
            </div>
          </td>
        </tr>
        <tr v-if="certificates.length === 0">
          <td>
            <span
              class="info-input plain-input inline-block minw-110 cursor-pointer"
              :class="{ placeholder: true }"
              @click="editMode ? handleEmptyIssueDateClick() : null"
            >
              클릭하여 발급일 선택
            </span>
          </td>
          <td style="position:relative;">
            <CommonInput input-class="info-input plain-input" :disabled="!editMode" />
            <div v-if="editMode" class="row-action-btns action-btn-group">
              <Button type="button" btn-class="icon-btn" disabled :title="'위로 이동'">
                <i class="fa fa-arrow-up"></i>
              </Button>
              <Button type="button" btn-class="icon-btn" disabled :title="'아래로 이동'">
                <i class="fa fa-arrow-down"></i>
              </Button>
              <Button type="button" btn-class="icon-btn delete" disabled :title="'삭제'">
                <i class="fa fa-trash"></i>
              </Button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <ToastConfirm
      :visible="toastConfirmVisible"
      message="정말 삭제하시겠습니까?"
      @confirm="confirmDelete"
      @cancel="toastConfirmVisible = false"
    />
  </div>
</template>

<script>
import { computed, ref, nextTick } from 'vue';
import { handleEmptyRowClick } from '@/utils/emptyRowAction';
import DateRangePicker from '@/components/common/DateRangePicker.vue';
import Button from '@/components/common/Button.vue';
import CommonInput from '@/components/common/CommonInput.vue';
import DateInput from '@/components/common/DateInput.vue';
import ToastConfirm from '@/components/common/ToastConfirm.vue';

export default {
  name: 'CertificateTable',
  components: { DateRangePicker, Button, CommonInput, DateInput, ToastConfirm },
  props: {
    employee: {
      type: Object,
      default: () => ({}),
    },
    editMode: {
      type: Boolean,
      default: false,
    },
    errors: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:employee'],

  setup(props, { emit }) {
    const firstMount = ref(true);
    // ToastConfirm 삭제 관련 상태
    const toastConfirmVisible = ref(false);
    const deleteIndex = ref(-1);

    const showDeleteConfirm = (index) => {
      deleteIndex.value = index;
      toastConfirmVisible.value = true;
    };

    const confirmDelete = () => {
      if (deleteIndex.value !== -1) {
        certificates.value = certificates.value.filter((_, i) => i !== deleteIndex.value);
      }
      toastConfirmVisible.value = false;
      deleteIndex.value = -1;
    };

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

    // 빈 행에서 발급일 클릭 시: 공통 유틸 사용
    const handleEmptyIssueDateClick = () => {
      handleEmptyRowClick(addCertificate, showMonthInput);
    };

    setTimeout(() => { firstMount.value = false; }, 700);
    return {
      certificates,
      addCertificate,
      showDeleteConfirm,
      confirmDelete,
      toastConfirmVisible,
      deleteIndex,
      moveUp,
      moveDown,
      formatIssueDate,
      updateIssueDate,
      activeMonthInput,
      showMonthInput,
      hideMonthInput,
      monthInputs,
      firstMount,
      handleEmptyIssueDateClick,
    };
  },
};
</script>

<style scoped>
.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 20px;
  font-weight: 700;
  color: #333;
  letter-spacing: -0.5px;
  gap: 8px;
}
.section-title h4 {
  border-bottom: 2px solid #007bff;
  padding-bottom: 8px;
  margin: 0;
}
@media (max-width: 900px) {
  .section-title {
    font-size: 15px;
    margin-bottom: 6px;
  }
  .section-title h4 {
    font-size: 15px;
    padding-bottom: 4px;
    border-bottom: 2px solid #007bff;
  }
}
@media (max-width: 600px) {
  .section-title {
    font-size: 13px;
    margin-bottom: 3px;
  }
  .section-title h4 {
    font-size: 13px;
    padding-bottom: 2px;
    border-bottom: 2px solid #007bff;
  }
}
@media (max-width: 900px) {
  .section-title {
    font-size: 15px;
    margin-bottom: 6px;
    padding-bottom: 4px;
  }
}
@media (max-width: 600px) {
  .section-title {
    font-size: 13px;
    margin-bottom: 3px;
    padding-bottom: 2px;
  }
}
.add-btn-wrapper {
  display: flex;
  align-items: center;
  margin-left: auto;
}
.add-row-btn {
  font-size: 15px;
  font-weight: 500;
  padding: 6px 18px;
  border-radius: 6px;
  margin-left: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: background 0.18s, color 0.18s;
}
.add-row-btn:hover {
  background: #e9ecef;
  color: #333;
}
.table-section {
  margin-bottom: 32px;
  min-height: unset;
  height: auto;
}
.info-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}
.info-table th, .info-table td {
  border: 1px solid #e0e0e0;
  padding: 8px 12px;
  text-align: left;
}
.info-table th {
  background: #f8f9fa;
  font-weight: 600;
}
/* 아이콘 버튼 스타일 + 행 hover 시에만 노출, 마지막 셀 overlay */
.action-btn-group {
  display: flex;
  gap: 4px;
}
.info-table td {
  position: relative;
}
.row-action-btns {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.18s;
  z-index: 2;
}
tr:hover .row-action-btns {
  opacity: 1;
}
.icon-btn {
  background: #f5f6fa;
  border: none;
  border-radius: 6px;
  padding: 6px 8px;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
  font-size: 18px;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.icon-btn:hover:not(:disabled) {
  background: #e1e7ef;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  color: #1976d2;
  transform: translateY(-2px) scale(1.08);
}
.icon-btn.delete:hover:not(:disabled) {
  background: #ffeaea;
  color: #e53935;
}
</style>
