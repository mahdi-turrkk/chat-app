import Vue from 'vue'
import VueRouter from 'vue-router'
import logIn from '../views/logIn.vue'
import messages from '../views/messages.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'login',
    component: logIn
  },
  {
    path: '/messaging',
    name: 'messaging',
    component: messages
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
