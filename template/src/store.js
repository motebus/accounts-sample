import Vue from 'vue';
import Vuex from 'vuex';
import router from '@/router';
const LoginUrl = 'https://accounts.ypcloud.com/login?redirect_uri=http://{{siteRoot}}/callback';

Vue.use(Vuex);

export default new Vuex.Store({
  state : {
    UToken: null,
    Uid: null,
    user: null
  },
  getters : {
    user (state) {
      return state.user;
    },
    isAuthenticated (state) {
      return state.UToken !== null;
    },
    headerState: () => {
      let result = router.currentRoute.query.header ? parseInt(router.currentRoute.query.header) : 1;
      return result == 1;
    },
    footerState: () => {
      let result = router.currentRoute.query.footer ? parseInt(router.currentRoute.query.footer) : 1;
      return result == 1;
    },
    titleState: () => {
      let result = router.currentRoute.query.title ? parseInt(router.currentRoute.query.title) : 1;
      return result == 1;
    }
  },
  mutations :{
    authUser (state, userData) {
      state.UToken = userData.UToken;
      state.Uid = userData.Uid;
      state.user = userData;
    },
    storeUser (state, user) {
      state.user = user;
    },
    clearAuthData (state) {
      state.UToken = null;
      state.Uid = null;
      state.use = null;
    }
  },
  actions : {
    signup ({commit, dispatch}, authData) {
      commit('authUser', {
        UToken: authData.UToken,
        Uid: authData.Uid
      });
      const now = new Date();
      const expirationDate = new Date(now.getTime() + authData.expiresIn * 1000);
      localStorage.setItem('UToken', authData.UToken);
      localStorage.setItem('Uid', authData.Uid);
      localStorage.setItem('user', JSON.stringify(authData));
      localStorage.setItem('expirationDate', expirationDate);
      dispatch('storeUser', authData);
      //dispatch('setLogoutTimer', authData.expiresIn);
    },
    login ({commit, dispatch}, authData) {
      const now = new Date();
      const expirationDate = new Date(now.getTime() + authData.expiresIn * 1000);
      localStorage.setItem('UToken', authData.UToken);
      localStorage.setItem('Uid', authData.Uid);
      localStorage.setItem('user', JSON.stringify(authData));
      localStorage.setItem('expirationDate', expirationDate);
      commit('authUser', authData);
      commit('storeUser', authData);
      //dispatch('setLogoutTimer', authData.expiresIn);
    },
    logout ({commit}) {
      commit('clearAuthData');
      localStorage.removeItem('expirationDate');
      localStorage.removeItem('UToken');
      localStorage.removeItem('Uid');
      localStorage.removeItem('user');
      window.location.href = LoginUrl;
    },
    fetchUser ({commit}) {
      let user = localStorage.getItem('user');
      if(user)
        commit('authUser', JSON.parse(user));
    }

  }
  // modules : {
  //   authenticate
  // }
});
