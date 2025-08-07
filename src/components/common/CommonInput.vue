<template>
  <label :class="labelClass" style="width: 100%">
    <span v-if="label">{{ label }}</span>
    <input
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      v-bind="inputAttrs"
      :class="inputClass"
      :disabled="disabled"
      @keyup.enter="$emit('enter', $event)"
    />
  </label>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  inputClass: { type: String, default: '' },
  labelClass: { type: String, default: '' },
  inputAttrs: { type: Object, default: () => ({}) },
  disabled: { type: Boolean, default: false },
});
</script>

<style scoped>
input[type="text"],
input[type="search"],
input[type="email"],
input[type="number"] {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
  font-size: 14px;
}

/* 테이블에서 텍스트처럼 보이게 (plain-input) */
input.plain-input {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 0;
  min-width: 0;
  font-size: 15px;
  color: #222;
}
</style>
