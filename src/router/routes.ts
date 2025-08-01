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
    path: '/pc',
    component: () => import('@/views/pc/Index.vue'),
  },
  {
    path: '/phone',
    component: () => import('@/views/phone/Index.vue'),
  },
] as RouteRecordRaw[]
