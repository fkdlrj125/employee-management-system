<template>
  <label :class="labelClass">
    <span v-if="label">{{ label }}</span>
    <input
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      v-bind="inputAttrs"
      :class="inputClass"
    />
  </label>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'month' },
  inputClass: { type: String, default: '' },
  labelClass: { type: String, default: '' },
  inputAttrs: { type: Object, default: () => ({}) },
});
</script>

<style scoped>
label {
  display: flex;
  flex-direction: column;
  font-size: 15px;
  color: #495057;
}
input[type="date"],
input[type="month"] {
  margin-top: 4px;
  padding: 6px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 15px;
}
</style>
