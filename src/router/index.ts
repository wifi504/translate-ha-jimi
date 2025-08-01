import { createRouter, createWebHistory } from 'vue-router'
import routes from '@/router/routes.ts'

const router = createRouter({
  history: createWebHistory('/hajimi/'),
  routes,
})

router.beforeEach(() => {

})

export default router
