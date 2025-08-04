import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/css/main.css'

Vue.config.productionTip = false

console.log('Vue app initializing...')
console.log('Router:', router)
console.log('Store:', store)

const vm = new Vue({
  router,
  store,
  render: h => h(App),
  mounted() {
    console.log('Vue app mounted successfully!')
    console.log('Current route:', this.$route)
    console.log('Store state:', this.$store.state)
  }
}).$mount('#app')

// 전역에서 접근 가능하도록
window.vm = vm

console.log('Vue instance created:', vm)