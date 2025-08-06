<template>
  <button
    :type="type"
    :class="['btn', btnClass]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup>
const props = defineProps({
  type: { type: String, default: 'button' },
  label: { type: String, default: '' },
  btnClass: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
});
</script>

<style scoped>
.btn {
  padding: 8px 18px;
  border-radius: 4px;
  border: none;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-primary {
  background: #1976d2;
  color: #fff;
}
.btn-primary:disabled {
  background: #b0c4de;
  color: #fff;
  cursor: not-allowed;
}
.btn-secondary {
  background: #e0e0e0;
  color: #333;
}
.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
