import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/Login.vue'
import CrecheList from '../views/CrecheList.vue'
import Creche from '../views/Creche.vue'

const routes = [
    {
      path: '/login',
      name: 'Login',
      component: LoginPage
    },
    {
      path: '/creches',
      name: 'CrecheList',
      component: CrecheList
    },
    {
        path: '/creche/:id',
        name: 'Creche',
        component: Creche
      }
  ]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router