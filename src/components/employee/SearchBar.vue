<template>
  <div class="search-bar">
    <div class="search-input-group">
      <i class="fas fa-search"></i>
      <div class="search-input-wrapper">
        <CommonInput
          :modelValue="modelValue"
          @update:modelValue="$emit('update:modelValue', $event)"
          @input="$emit('input', $event)"
          @enter="$emit('enter')"
          :placeholder="placeholder"
          :input-class="['plain-input', 'search-input']"
        />
        <Button v-if="modelValue" @click="$emit('clear')" btn-class="clear-search">
          <i class="fas fa-times"></i>
        </Button>
      </div>
    </div>
    <div class="search-btn-wrapper">
      <Button @click="$emit('search')" btn-class="btn btn-search">검색</Button>
    </div>
  </div>
</template>

<script setup>
import Button from '../common/Button.vue';
import CommonInput from '../common/CommonInput.vue';
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '검색...' },
  inputClass: { type: String, default: 'search-input' },
});
const emit = defineEmits(['input', 'enter', 'clear', 'search']);
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}
/* input과 버튼, 아이콘, clear 버튼이 겹치지 않도록 보정 */
.search-input-group {
  display: flex;
  align-items: center;
  flex: 1 1 0%;
  gap: 0;
  width: 100%;
  position: relative;
}
.search-input-wrapper {
  display: flex;
  align-items: center;
  flex: 1 1 0%;
  width: 100%;
  position: relative;
}
.search-input {
  width: 100%;
  min-width: 220px;
  max-width: 100%;
  font-size: 15px;
  border-radius: 4px;
  border: 1px solid #ddd;
  padding: 8px 2.5rem 8px 2.7rem; /* 왼쪽 padding을 2.7rem로 늘림 */
  background: #fff;
  transition: border 0.2s;
  box-sizing: border-box;
  flex: 1 1 0%;
  margin-right: 0;
  height: 40px;
}
.search-input:focus {
  border: 1.5px solid #1976d2;
  outline: none;
}
.search-input-group > .fa-search {
  position: absolute;
  left: 18px; /* padding-left와 일치하도록 조정 */
  top: 50%;
  transform: translateY(-50%);
  color: #bdbdbd;
  font-size: 18px;
  pointer-events: none;
  z-index: 2;
  height: 20px;
  line-height: 1;
}
.clear-search {
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
.search-btn-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  margin-left: 8px;
}
</style>
