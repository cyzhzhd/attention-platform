import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '../views/Login.vue';
import RoomList from '../views/RoomList.vue';
import Room from '../views/Room.vue';
import AddRoom from '../views/AddRoom.vue';
import TeamSettings from '../views/TeamSettings.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/roomList',
    name: 'RoomList',
    component: RoomList,
  },
  {
    path: '/room/:roomId/:roomName',
    name: 'Room',
    component: Room,
  },
  {
    path: '/add-room',
    name: 'AddRoom',
    component: AddRoom,
  },
  {
    path: '/team-settings/:roomId/:roomName',
    name: 'TeamSettings',
    component: TeamSettings,
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;