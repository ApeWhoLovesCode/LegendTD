import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'index',
    component: () => import('../views/index.vue') 
    // children: []
  },
  {
    path: '/game',
    name: 'game',
    component: () => import('../views/game/index.vue') 
    // children: []
  }
]

const router = createRouter({
  history: createWebHistory(), // hash模式：createWebHashHistory history模式：createWebHistory
  routes
})

export default router