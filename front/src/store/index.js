import { createStore } from 'vuex'
import axios from 'axios'

export default createStore({
  state: {
    user: null,
    creches: []
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    setCreches(state, creches) {
      state.creches = creches
    },
    addCreche(state, creche) {
      state.creches.push(creche)
    },
    removeCreche(state, crecheId) {
       state.creches = state.creches.filter(creche => creche.id !== crecheId)
    }
  },
  actions: {
    async login({ commit }, username) {
      try {
        const response = await axios.get(`http://localhost:3000/user`, {
            params: { username }
          });
        commit('setUser', response.data)
        return response.data
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    },
    async register({ commit }, { username, email }) {
        try {
          const response = await axios.put('http://localhost:3000/user', { username, email });
          commit('setUser', response.data);
          return response.data;
        } catch (error) {
          console.error('Registration error:', error);
          if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
          }
          throw error;
        }
      },
    async logout({ commit }) {
        try {
          // No logout Api hence we just redirect to login page
          commit('setUser', null)
        } catch (error) {
          console.error('Logout error:', error)
        }
    },
    async fetchCreches({ commit }) {
      try {
        const response = await axios.get('http://localhost:3000/child-care')
        commit('setCreches', response.data)
      } catch (error) {
        console.error('Fetch creches error:', error)
        throw error
      }
    }
  },
  getters: {
    isLoggedIn: state => !!state.user
  }
})