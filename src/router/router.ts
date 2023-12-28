import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import RoomOverview from '../views/room-overview.vue';

export interface RouteMeta {
  name: string;
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: {
      name: 'room-overview',
    },
  },
  {
    path: `/room-overview`,
    name: 'room-overview',
    component: RoomOverview,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
