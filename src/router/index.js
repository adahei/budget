import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

function load (view) {
  return () => import(`@/views/${view}.vue`)
}

const routes = [
  {
    path: '/',
    component: load('Start')
  },
  {
    path: '/login',
    component: load('Login')
  },
  {
    path: '/home',
    component: load('Home'),
    children: [
      {
        path: '',
        component: load('pages/Start')
      }
    ]
  }
]

const router = new Router({
  mode: 'hash',
  base: __dirname,
  routes
})

export default router
