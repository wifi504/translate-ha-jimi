import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/',
    component: () => import('@/views/Index.vue'),
  },
  {
    path: '/child1',
    component: () => import('@/views/child1/Index.vue'),
    children: [
      {
        path: 'test1',
        component: () => import('@/views/child1/test1/Index.vue'),
      },
      {
        path: 'child2',
        children: [
          {
            path: 'child3',
            component: () => import('@/views/child1/child2/child3/Index.vue'),
          },
          {
            path: 'test2',
            component: () => import('@/views/child1/child2/test2/Index.vue'),
            children: [
              {
                path: 'login',
                component: () => import('@/views/child1/child2/test2/login/Index.vue'),
              },
            ],
          },
        ],
      },
    ],
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
