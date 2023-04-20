import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'index',
    component: () => import('../views/index.vue') 
  },
  {
    path: '/gameVue',
    redirect: '/gameVue/1'
  },
  {
    path: '/gameVue/:id',
    name: 'gameVue',
    component: () => import('../views/game/index.vue') 
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('../views/test/index.vue') 
  },
  {
    path: '/game',
    redirect: '/game/1'
  },
  {
    path: '/game/:id',
    name: 'game',
    component: () => import('../views/gameWorker/index.vue') 
  },
]

const router = createRouter({
  history: createWebHistory(), // hash模式：createWebHashHistory history模式：createWebHistory
  routes
})

export default router