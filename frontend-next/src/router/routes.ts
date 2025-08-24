import type { RouteRecordRaw } from 'vue-router'
/**
 * Vue Router 路由配置自动生成(v1.0)
 * @author WIFI连接超时
 */
export default [
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/components/NotFound.vue'),
  },
  {
    path: '/',
    component: () => import('@/views/Index.vue'),
  },
  {
    path: '/haji-file',
    component: () => import('@/views/haji-file/Index.vue'),
  },
] as RouteRecordRaw[]
