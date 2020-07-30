import Vue from 'vue'
import VueRouter from 'vue-router'
import About from '../views/About'
import Home from '../views/Home.vue'
import Users from '../views/admin/Users'
import ApiKeys from '@/views/admin/ApiKeys'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/admin/users',
    name: 'Konten',
    component: Users
  },
  {
    path: '/admin/api-keys',
    component: ApiKeys
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
