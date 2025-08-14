<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { blockCopyAndContextMenu } from './utils/blockCopyAndContextMenu';

export default {
  name: 'App',
  mounted() {
    blockCopyAndContextMenu();
  },
};
</script>

<style>
@import './assets/css/main.css';
</style>
