<template>
  <div id="app">
    <b-container class="py-3">
      <b-row>
        <b-col>
          <h1 class="text-center mb-4"><strong>Tessy Crèche Management</strong></h1>
          <b-nav pills class="mb-3 justify-content-center">
            <b-nav-item v-if="isLoggedIn" to="/creches"><b-icon icon="list-ul"></b-icon> Crèches</b-nav-item>
            <b-nav-item v-if="!isLoggedIn" to="/login"><b-icon icon="person-fill"></b-icon> Login</b-nav-item>
            <b-nav-item v-if="isLoggedIn" @click="logout"><b-icon icon="box-arrow-right"></b-icon> Logout</b-nav-item>
          </b-nav>
          <b-alert v-if="isLoggedIn" show variant="info" class="text-center">
            Welcome, {{ user.username }}
          </b-alert>
          <router-view></router-view>
        </b-col>
      </b-row>
    </b-container>
    <AppFooter />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import AppFooter from './components/AppFooter.vue'  // Update the import path

export default {
  name: 'App',
  components: {
    AppFooter
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const isLoggedIn = computed(() => store.getters.isLoggedIn)
    const user = computed(() => store.state.user)

    const logout = async () => {
      await store.dispatch('logout')
      router.push('/login')
    }

    return {
      isLoggedIn,
      user,
      logout
    }
  }
}
</script>

<style>
#app {
  min-height: 50vh;
  position: relative;
  padding-bottom: 60px; /* Adjust this value based on your footer's height */
}

body {
  margin: 0;
  padding: 0;
}
</style>