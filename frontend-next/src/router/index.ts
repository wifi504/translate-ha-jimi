import { createRouter, createWebHistory } from 'vue-router'
import routes from '@/router/routes.ts'
import { useLoadingStore } from '@/stores/loadingStore.ts'

const router = createRouter({
  history: createWebHistory(`/${import.meta.env.VITE_BASEURL}`),
  routes,
})

router.beforeEach(() => {
  useLoadingStore().show()
})

router.afterEach(() => {
  useLoadingStore().hide()
})

export default router
