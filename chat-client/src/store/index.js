import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    username : ""
  },
  getters: {
    getUsername(state) {
      return state.username;
    }
  },
  mutations: {
    setUsername(state, newValue) {
      state.username = newValue;
    }
  },
  actions: {
  },
  modules: {
  }
})

