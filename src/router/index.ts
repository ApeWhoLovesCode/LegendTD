import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'index',
    component: () => import('../views/index.vue') 
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
  {
    path: '/dev/createMap',
    name: 'createMap',
    component: () => import('../views/dev/createMap/index.vue') 
  },
  // {
  //   path: '/teamfight-tactics',
  //   name: 'Teamfight Tactics',
  //   component: () => import('../views/teamfightTactics/index.vue') 
  // },
]

const router = createRouter({
  history: createWebHistory(), // hash模式：createWebHashHistory history模式：createWebHistory
  routes
})

export default router