<template>
  <div class="login-container">
    <div class="logo-container">
      <img src="@/assets/logo.png" alt="Logo" class="logo">
    </div>
    <div class="login-form">
      <h2 class="text-center mb-4"><strong>{{ isRegistering ? "S'inscrire" : 'Connexion' }}</strong></h2>
      <b-form @submit.prevent="handleSubmit" class="mx-auto" style="max-width: 300px;">
        <b-form-group label="Username" label-for="username">
          <b-form-input id="username" v-model="username" required placeholder="Enter username"></b-form-input>
        </b-form-group>

        <b-form-group v-if="isRegistering" label="Email" label-for="email">
          <b-form-input id="email" v-model="email" type="email" required placeholder="Enter email"></b-form-input>
        </b-form-group>

        <b-button type="submit" variant="primary" class="w-100 mt-3">
          {{ isRegistering ? "S'inscrire" : 'Connexion' }}
        </b-button>
      </b-form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'LoginPage',
  setup() {
    const store = useStore()
    const router = useRouter()
    const username = ref('')
    const email = ref('')
    const isRegistering = ref(false)

    const handleSubmit = async () => {
      try {
        if (isRegistering.value) {
          await store.dispatch('register', { username: username.value, email: email.value })
        } else {
          await store.dispatch('login', username.value)
        }
        router.push('/creches')
      } catch (error) {
        if (error.response && error.response.status === 404) {
          isRegistering.value = true
        } else {
          console.error('Authentication error:', error)
        }
      }
    }

    return {
      username,
      email,
      isRegistering,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 50vh;
  background-color: #f0f8ff; /* Light blue background */
}

.logo-container {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.logo {
  max-width: 200px;
  height: auto;
}

.login-form {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #007bff; /* Blue color for the title */
}

.b-form-input, .b-button {
  margin-bottom: 1rem;
}

.b-button {
  background-color: #007bff;
  border-color: #007bff;
}

.b-button:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}
</style>