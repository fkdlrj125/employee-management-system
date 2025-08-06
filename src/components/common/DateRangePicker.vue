<template>
  <transition name="fade-modal">
    <div v-if="visible" class="date-range-modal-overlay">
      <div class="date-range-modal">
        <h3>기간 선택</h3>
        <div class="date-range-fields">
          <DateInput
            label="시작일"
            v-model="localStart"
            type="month"
            input-class="date-range-input"
          />
          <span>~</span>
          <DateInput
            label="종료일"
            v-model="localEnd"
            type="month"
            input-class="date-range-input"
          />
        </div>
        <div class="date-range-modal-actions">
          <Button btn-class="btn-primary" @click="confirm">확인</Button>
          <Button btn-class="btn-secondary" @click="emit('close')">취소</Button>
        </div>
      </div>
    </div>
  </transition>
</template>


<script setup>
import { ref, watch } from 'vue';
import DateInput from './DateInput.vue';
import Button from './Button.vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  start: { type: String, default: '' },
  end: { type: String, default: '' },
});
const emit = defineEmits(['select', 'close']);

const localStart = ref(props.start);
const localEnd = ref(props.end);

watch(() => props.start, val => { localStart.value = val; });
watch(() => props.end, val => { localEnd.value = val; });

function confirm() {
  emit('select', { start: localStart.value, end: localEnd.value });
  emit('close');
}
</script>

<style scoped>
.fade-modal-enter-active, .fade-modal-leave-active {
  transition: opacity 0.2s;
}
.fade-modal-enter-from, .fade-modal-leave-to {
  opacity: 0;
}
.date-range-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.date-range-modal {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
  padding: 32px 28px 24px 28px;
  min-width: 320px;
  max-width: 90vw;
  animation: fadeInUp 0.3s;
}
.date-range-fields {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 18px 0 24px 0;
}
.date-range-fields label {
  display: flex;
  flex-direction: column;
  font-size: 15px;
  color: #495057;
}
.date-range-fields input[type="date"],
.date-range-fields input[type="month"] {
  margin-top: 4px;
  padding: 6px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 15px;
}
.date-range-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
