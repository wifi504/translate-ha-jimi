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
    path: '/file',
    component: () => import('@/views/file/Index.vue'),
  },
  {
    path: '/key',
    component: () => import('@/views/key/Index.vue'),
  },
  {
    path: '/translate',
    component: () => import('@/views/translate/Index.vue'),
  },
] as RouteRecordRaw[]
