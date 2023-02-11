import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'index',
    component: () => import('../views/index.vue') 
  },
  {
    path: '/game',
    redirect: '/game/1'
  },
  {
    path: '/game/:id',
    name: 'game',
    component: () => import('../views/game/index.vue') 
  }
]

const router = createRouter({
  history: createWebHistory(), // hash模式：createWebHashHistory history模式：createWebHistory
  routes
})

export default router