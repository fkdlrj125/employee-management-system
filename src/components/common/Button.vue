<template>
  <button
    :type="type"
    :class="['btn', btnClass]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot>{{ label }}</slot>
  </button>


</template>

<script setup>
const props = defineProps({
  type: { type: String, default: 'button' },
  label: { type: String, default: '' },
  btnClass: { type: [String, Array], default: '' },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(['click']);

function handleClick(e) {
  emit('click', e);
}
</script>


