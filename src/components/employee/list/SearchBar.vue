<template>
  <form class="searchbar-root" @submit.prevent="$emit('search')">
    <div class="searchbar-input-group">
      <span class="searchbar-icon">
        <i class="fas fa-search"></i>
      </span>
      <input
        type="text"
        class="searchbar-input"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value); $emit('input', $event.target.value)"
        @keyup.enter="$emit('enter')"
      />
      <button
        v-if="modelValue"
        type="button"
        class="searchbar-clear-btn"
        @click="$emit('clear')"
        aria-label="검색어 지우기"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
    <button type="submit" class="searchbar-search-btn btn btn-primary">검색</button>
  </form>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '검색...' },
});
const emit = defineEmits(['update:modelValue', 'input', 'enter', 'clear', 'search']);
</script>

<style scoped>
.searchbar-root {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
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
.searchbar-search-btn {
  flex-shrink: 0;
  height: 40px;
  padding: 0 20px;
  margin-left: 8px;
  font-size: 15px;
  border-radius: 4px;
}
</style>
