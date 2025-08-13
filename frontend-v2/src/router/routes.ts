import type { RouteRecordRaw } from 'vue-router'
/**
 * Vue Router 路由配置自动生成(v1.0)
 * @author WIFI连接超时
 */
export default [
  {
    path: '/',
    component: () => import('@/views/Index.vue'),
  },
  {
    path: '/base64',
    component: () => import('@/views/base64/Index.vue'),
  },
] as RouteRecordRaw[]
