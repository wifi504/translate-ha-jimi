import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/components/NotFound.vue'),
  },
] as RouteRecordRaw[]
