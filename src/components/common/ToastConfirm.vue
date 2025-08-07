<template>
  <div v-if="visible" class="toast-confirm-overlay">
    <div class="toast-confirm">
      <div class="toast-message">
        <span class="toast-icon" aria-hidden="true">⚠️</span>
        <span class="toast-text">{{ message }}</span>
      </div>
      <div class="toast-actions">
        <button class="btn btn-primary toast-btn" @click="onConfirm">확인</button>
        <button class="btn btn-secondary toast-btn" @click="onCancel">취소</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToastConfirm',
  props: {
    message: { type: String, required: true },
    visible: { type: Boolean, default: false },
  },
  emits: ['confirm', 'cancel'],
  methods: {
    onConfirm() {
      this.$emit('confirm');
    },
    onCancel() {
      this.$emit('cancel');
    },
  },
};
</script>

<style scoped>
  .toast-confirm-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.2);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    z-index: 9999;
  }
  .toast-confirm {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    border: 1.5px solid #e0e0e0;
    padding: 28px 36px 22px 36px;
    min-width: 320px;
    max-width: 90vw;
    text-align: center;
    margin-top: 60px;
    animation: fadeInDown 0.35s cubic-bezier(.4,1.4,.6,1) both;
  }
  .toast-message {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 24px;
    gap: 10px;
    word-break: keep-all;
  }
  .toast-icon {
    font-size: 22px;
    margin-right: 4px;
    vertical-align: middle;
  }
  .toast-text {
    display: inline-block;
    vertical-align: middle;
  }
  .toast-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
  }
  .toast-btn {
    min-width: 80px;
    height: 42px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 6px;
    transition: background 0.18s, color 0.18s, box-shadow 0.18s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    padding: 0 18px;
    outline: none;
    cursor: pointer;
  }
  .toast-btn:active {
    box-shadow: 0 1px 2px rgba(0,0,0,0.08);
    opacity: 0.92;
  }
  .btn-primary.toast-btn:hover {
    background: #0056b3;
    color: #fff;
  }
  .btn-secondary.toast-btn:hover {
    background: #e9ecef;
    color: #333;
  }
  @media (max-width: 600px) {
    .toast-confirm {
      min-width: 90vw;
      padding: 18px 6vw 14px 6vw;
      font-size: 15px;
    }
    .toast-message {
      font-size: 15px;
    }
    .toast-btn {
      min-width: 60px;
      font-size: 14px;
      height: 36px;
      padding: 0 10px;
    }
  }
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-30px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
