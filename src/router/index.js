import Vue from 'vue'
import VueRouter from 'vue-router'
import About from '../views/About'
import Home from '../views/Home.vue'
import UserList from '../views/admin/UserList'
import ApiKeys from '@/views/admin/ApiKeys'
import UserForm from '@/views/admin/UserForm'

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
    name: 'user-list',
    component: UserList
  },
  {
    path: '/admin/users/:id',
    name: 'user-form',
    component: UserForm
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
