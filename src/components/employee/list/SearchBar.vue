<template>
  <div class="searchbar-root">
    <div class="searchbar-input-group">
      <span class="searchbar-icon">
        <i class="fas fa-search"></i>
      </span>
      <input
        type="text"
        class="searchbar-input"
        :placeholder="placeholder"
        :value="inputValue"
        @input="onInput"
        @keyup.enter="$emit('enter')"
      />
      <button
        v-if="modelValue"
        type="button"
        class="searchbar-clear-btn"
        @click="onClear"
        aria-label="검색어 지우기"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
// clear 버튼 클릭 시 inputValue를 직접 초기화하고 부모에도 반영
function onClear() {
  inputValue.value = '';
  emit('update:modelValue', '');
  emit('input', '');
  emit('clear');
}
import { ref, watch } from 'vue';
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '검색...' },
});
const emit = defineEmits(['update:modelValue', 'input', 'enter', 'clear', 'search']);

const inputValue = ref(props.modelValue);

// modelValue가 변경될 때마다 inputValue를 동기화
watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal;
});

// input 이벤트 핸들러
function onInput(e) {
  inputValue.value = e.target.value;
  emit('update:modelValue', inputValue.value);
  emit('input', inputValue.value);
}
</script>

<style scoped>
.searchbar-root {
  display: flex;
  align-items: center;
  width: 100%;
}
.searchbar-input-group {
  position: relative;
  flex: 1 1 0%;
  display: flex;
  align-items: center;
}
.searchbar-input {
  width: 100%;
  padding: 8px 36px 8px 36px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 15px;
  background: #fff;
  transition: border 0.2s;
  box-sizing: border-box;
  height: 40px;
}
.searchbar-input:focus {
  border: 1.5px solid #1976d2;
  outline: none;
}
.searchbar-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #bdbdbd;
  font-size: 18px;
  pointer-events: none;
  z-index: 2;
}
.searchbar-clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #aaa;
  font-size: 16px;
  padding: 0 4px;
  cursor: pointer;
  z-index: 3;
}
</style>
