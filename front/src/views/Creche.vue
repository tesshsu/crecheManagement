<template>
  <div class="creche-container">
    <div class="header-container">
      <img src="@/assets/header.png" alt="Header" class="header-image">
    </div>
    <div class="creche-content">
      <b-container>
        <b-row class="my-4">
          <b-col>
            <h2 class="text-center"><strong>Crèche Details</strong></h2>
          </b-col>
        </b-row>
        <b-row v-if="creche">
          <b-col md="8" offset-md="2">
            <b-card>
              <b-card-title>
                <h3>{{ creche.name }}</h3>
              </b-card-title>
              <b-card-text>
                <b-list-group>
                  <b-list-group-item>
                    <strong>Crèche ID:</strong> {{ creche.id }}
                  </b-list-group-item>
                  <b-list-group-item>
                    <strong>Creator:</strong> {{ creche.creator.username }}
                  </b-list-group-item>
                  <b-list-group-item>
                    <strong>Creator ID:</strong> {{ creche.creator_id }}
                  </b-list-group-item>
                </b-list-group>
              </b-card-text>
            </b-card>
          </b-col>
        </b-row>

        <!-- Children Section -->
        <b-row class="mt-4">
          <b-col>
            <h3 class="text-center">Children in this Crèche</h3>
          </b-col>
        </b-row>

        <!-- Add New Child button and form -->
        <b-row class="mt-3">
          <b-col class="text-center">
            <b-button @click="toggleAddChildForm" variant="success" class="mb-3">
              {{ isAddingChild ? 'Cancel' : '+ Add New Child' }}
            </b-button>
          </b-col>
        </b-row>
        <b-form v-if="isAddingChild" @submit.prevent="addChild" class="mb-3">
          <b-form-group label="First Name" label-for="child-first-name">
            <b-form-input
              id="child-first-name"
              v-model="newChildFirstName"
              required
              placeholder="Enter first name"
            ></b-form-input>
          </b-form-group>
          <b-form-group label="Last Name" label-for="child-last-name">
            <b-form-input
              id="child-last-name"
              v-model="newChildLastName"
              required
              placeholder="Enter last name"
            ></b-form-input>
          </b-form-group>
          <b-button type="submit" variant="primary">Add Child</b-button>
        </b-form>

        <!-- Children List -->
        <b-row class="mt-3">
          <b-col md="8" offset-md="2">
            <b-list-group v-if="children.length">
              <b-list-group-item v-for="child in children" :key="child.id" class="d-flex justify-content-between align-items-center">
                {{ child.first_name }} {{ child.last_name }}
                <b-button @click="removeChild(child.id)" variant="danger" size="sm">Remove</b-button>
              </b-list-group-item>
            </b-list-group>
            <p v-else class="text-center">No children registered in this crèche.</p>
          </b-col>
        </b-row>

        <!-- Error Message -->
        <b-row v-if="errorMessage" class="mt-3">
          <b-col md="8" offset-md="2">
            <b-alert show variant="danger">{{ errorMessage }}</b-alert>
          </b-col>
        </b-row>

        <b-row class="mt-4">
          <b-col class="text-center">
            <b-button variant="primary" @click="goBack">Back to Crèche List</b-button>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import api from '../services/api'

export default {
  name: 'CrecheDetailPage',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const creches = ref([])
    const children = ref([])
    const isAddingChild = ref(false)
    const newChildFirstName = ref('')
    const newChildLastName = ref('')
    const errorMessage = ref('')
    const crecheId = computed(() => parseInt(route.params.id))
    console.log('Creche ID:', crecheId.value)
    const creche = computed(() => 
      creches.value.find(c => c.id === crecheId.value)
    )

    const user = computed(() => store.state.user)

    onMounted(async () => {
      try {
        const [crechesResponse, childrenResponse] = await Promise.all([
          api.get('/child-care'),
          api.get(`/child-care/${crecheId.value}/children`)
        ])
        console.log('Fetched children:', childrenResponse.data)
        creches.value = crechesResponse.data
        children.value = childrenResponse.data
      } catch (error) {
        console.error('Error fetching data:', error)
        errorMessage.value = 'Error fetching data. Please try again.'
      }
    })

    const toggleAddChildForm = () => {
      isAddingChild.value = !isAddingChild.value
      newChildFirstName.value = ''
      newChildLastName.value = ''
    }

    const addChild = async () => {
      if (!user.value || !user.value.username) {
        errorMessage.value = 'You must be logged in to add a child. Please log in and try again.'
        return
      }

      try {
        const response = await api.post('/child/createAndAddToCreche', {
          child: {
            first_name: newChildFirstName.value,
            last_name: newChildLastName.value
          },
          creche: {
            creche_id: crecheId.value
          }
        }, {
          headers: { 'X-Auth': user.value.username }
        })

        console.log('API Response:', response.data)  // Log the entire response for debugging

        // Check the structure of the response and add the child accordingly
        if (response.data && response.data.child_id) {
          const newChild = {
            id: response.data.child_id,
            first_name: newChildFirstName.value,
            last_name: newChildLastName.value
          }
          children.value.push(newChild)
        } else {
          console.error('Unexpected API response structure:', response.data)
          errorMessage.value = 'Error adding child. Unexpected response from server.'
        }

        newChildFirstName.value = ''
        newChildLastName.value = ''
        isAddingChild.value = false
        errorMessage.value = ''
      } catch (error) {
        console.error('Error adding child:', error)
        if (error.response && error.response.status === 403) {
          errorMessage.value = 'You have no permission to add the child.'
        } else {
          errorMessage.value = 'Error adding child. Please try again.'
        }
      }
    }

    const removeChild = async (childId) => {
      try {
        await api.delete(`/child-care/${crecheId.value}/child/${childId}`, {
          headers: { 'X-Auth': user.value.username }
        })
        children.value = children.value.filter(child => child.id !== childId)
        errorMessage.value = ''
      } catch (error) {
        console.error('Error removing child:', error)
        if (error.response && error.response.status === 403) {
          errorMessage.value = 'You have no permission to delete this child since you are not the creator of this child.'
        } else {
          errorMessage.value = 'Error removing child. Please try again.'
        }
      }
    }

    const goBack = () => {
      router.push('/creches')
    }

    return {
      creche,
      children,
      newChildFirstName,
      newChildLastName,
      errorMessage,
      addChild,
      removeChild,
      goBack,
      isAddingChild,
      toggleAddChildForm
    }
  }
}
</script>

<style scoped>
.creche-container {
  display: flex;
  flex-direction: column;
  min-height: 50vh;
  background-color: #f0f8ff; /* Light blue background */
}

.header-container {
  width: 100%;
  background-color: white;
  padding: 1rem 0;
  text-align: center;
}

.header-image {
  max-width: 200px;
  height: auto;
}

.creche-content {
  flex-grow: 1;
  padding: 2rem;
}

h2, h3 {
  color: #007bff; /* Blue color for the titles */
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

.b-card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>