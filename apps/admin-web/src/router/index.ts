import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      component: () => import('@/views/login/index.vue'),
    },
    {
      path: '/dashboard',
      component: () => import('@/views/dashboard/index.vue'),
    },
    {
      path: '/questions',
      component: () => import('@/views/questions/list.vue'),
    },
    {
      path: '/questions/create',
      component: () => import('@/views/questions/create.vue'),
    },
    {
      path: '/questions/:id/edit',
      component: () => import('@/views/questions/edit.vue'),
    },
    {
      path: '/tags',
      component: () => import('@/views/tags/index.vue'),
    },
    {
      path: '/feedback',
      component: () => import('@/views/feedback/index.vue'),
    },
    {
      path: '/users',
      component: () => import('@/views/users/index.vue'),
    },
  ],
});
