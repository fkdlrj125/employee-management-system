
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/css/main.css';
import './assets/css/common/plain-input.css';
import Toast from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

console.log('Vue app initializing...');
console.log('Router:', router);
console.log('Store:', store);

// 앱 시작 시 인증 상태 복원
store.dispatch('auth/initAuth');

const app = createApp(App);
app.use(router);
app.use(store);
app.use(Toast);
app.mount('#app');

// 전역에서 접근 가능하도록
window.app = app;

console.log('Vue app created:', app);
