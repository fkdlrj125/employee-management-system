import { ref } from 'vue';

/**
 * 공통 테이블 행 관리 훅
 * @param {Array} initialRows - 초기 행 배열
 * @returns {Object} 행 추가/삭제/이동/삭제확인 모달 등 공통 로직
 */
export function useTableRows(initialRows = []) {
  const rows = ref([...initialRows]);
  const toastConfirmVisible = ref(false);
  const deleteIndex = ref(-1);

  function addRow(newRow) {
    rows.value = [...rows.value, newRow];
  }

  function showDeleteConfirm(index) {
    deleteIndex.value = index;
    toastConfirmVisible.value = true;
  }

  function confirmDelete() {
    if (deleteIndex.value !== -1) {
      rows.value = rows.value.filter((_, i) => i !== deleteIndex.value);
    }
    toastConfirmVisible.value = false;
    deleteIndex.value = -1;
  }

  function moveUp(index) {
    if (index > 0) {
      const newRows = [...rows.value];
      const temp = newRows[index];
      newRows[index] = newRows[index - 1];
      newRows[index - 1] = temp;
      rows.value = newRows;
    }
  }

  function moveDown(index) {
    if (index < rows.value.length - 1) {
      const newRows = [...rows.value];
      const temp = newRows[index];
      newRows[index] = newRows[index + 1];
      newRows[index + 1] = temp;
      rows.value = newRows;
    }
  }

  return {
    rows,
    addRow,
    showDeleteConfirm,
    confirmDelete,
    moveUp,
    moveDown,
    toastConfirmVisible,
    deleteIndex,
  };
}
