import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/employee-list',
    name: 'EmployeeList',
    component: () => import('@/views/EmployeeList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/employee-detail/:id?',
    name: 'EmployeeDetail',
    component: () => import('@/views/EmployeeDetail.vue'),
    meta: { requiresAuth: true }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 네비게이션 가드 - 인증이 필요한 페이지 접근 제어
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const token = sessionStorage.getItem('token')
  
  if (requiresAuth && !token) {
    // 인증이 필요한데 토큰이 없으면 로그인 페이지로
    next('/login')
  } else if (to.path === '/login' && token) {
    // 이미 로그인된 상태에서 로그인 페이지 접근 시 메인으로
    next('/employee-list')
  } else {
    // 그 외의 경우는 정상 진행
    next()
  }
})

export default router