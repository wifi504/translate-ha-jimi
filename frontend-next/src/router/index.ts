import { createRouter, createWebHistory } from 'vue-router'
import routes from '@/router/routes.ts'

const router = createRouter({
  history: createWebHistory(`/${import.meta.env.VITE_BASEURL}`),
  routes,
})

router.beforeEach(() => {

})

export default router
