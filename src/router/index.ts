import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Todos from '@/views/Todos.vue'
import Clients from '@/views/Clients.vue'
import Templates from '@/views/Templates.vue'
import CalendarEvents from '@/views/CalendarEvents.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: Login },
    { path: '/calendar-events', component: CalendarEvents },
    { path: '/todos', component: Todos },
    { path: '/clients', component: Clients },
    { path: '/templates', component: Templates },
    { path: '/:pathMatch(.*)*', redirect: '/todos' },
  ],
})

export default router
