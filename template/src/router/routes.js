const HelloWorld = () => import('@/views/HelloWorld.vue');
const CallBack = () => import('@/views/CallBack.vue');
const LoginUrl = 'https://accounts.ypcloud.com/login?redirect_uri=http://{{siteRoot}}/callback';

import store from '@/store';

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/hello'
  },
  {
    path: '/hello',
    name: 'HelloWorld',
    component: HelloWorld,
    beforeEnter (to, from, next) {
      store.dispatch('fetchUser');
      if (store.state.UToken) {
        next();
      } else {
        //next('/login');
        window.location.href = LoginUrl;
      }
    }
  },
  {
    path: '/callback',
    name: 'CallBack',
    component: CallBack,
    meta: {
      title: "callback login"
    },
    beforeEnter (to, from, next) {
      store.dispatch('fetchUser');
      if (!store.state.UToken) {
        next();
      } else {
        next('/hello');
      }
    }
  }

];

export default routes;
