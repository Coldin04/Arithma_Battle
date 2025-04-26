import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'



const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: '首页'
      }
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
      meta: {
        title: '关于'
      }
    },
    {
      path: '/practice',
      name: 'Practice',
      component: () => import('../views/Practice.vue'),
      meta: {
        title: '单人练习'
      }
    },
    {
      path: '/network-battle',
      name: 'NetworkBattle',
      component: () => import('../views/NetworkBattle.vue'),
      meta: {
        title: '在线比赛'
      }
    },
  ],
})

// 全局前置守卫：在每次导航前执行
router.beforeEach((to, from, next) => {
  // 从路由的meta中获取title，并设置给页面标题
  document.title = to.meta.title ? `${to.meta.title} - ArithmaBattle` : 'ArithmaBattle'
  next()
})

export default router
