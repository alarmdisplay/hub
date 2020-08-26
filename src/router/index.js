import Vue from 'vue'
import VueRouter from 'vue-router'
import About from '../views/About'
import Home from '../views/Home.vue'
import ApiKeyList from '@/views/admin/ApiKeyList'
import ApiKeyForm from '@/views/admin/ApiKeyForm'
import Display from '@/views/output/Display'
import OCR from '@/views/input/OCR'
import ResourceForm from '@/views/processing/ResourceForm'
import ResourceList from '@/views/processing/ResourceList'
import UserList from '../views/admin/UserList'
import UserForm from '@/views/admin/UserForm'
import WatchedFolderList from '@/views/input/WatchedFolderList'
import WatchedFolderForm from '@/views/input/WatchedFolderForm'

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
      path: '/input/watched-folders',
      name: 'watched-folder-list',
      component: WatchedFolderList
    },
    {
      path: '/input/watched-folders/:id',
      name: 'watched-folder-form',
      component: WatchedFolderForm
    },
    {
      path: '/input/ocr',
      name: 'ocr',
      component: OCR
    },
    {
      path: '/processing/resources',
      name: 'resource-list',
      component: ResourceList
    },
    {
      path: '/processing/resources/:id',
      name: 'resource-form',
      component: ResourceForm
    },
    {
      path: '/output/display',
      name: 'display',
      component: Display
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
      name: 'api-key-list',
      component: ApiKeyList
    },
    {
      path: '/admin/api-keys/:id',
      name: 'api-key-form',
      component: ApiKeyForm
    }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
