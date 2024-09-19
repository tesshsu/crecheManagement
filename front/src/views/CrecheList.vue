<template>
  <div class="creche-list-container">
    <div class="header-container">
      <img src="@/assets/header.png" alt="Header" class="header-image">
    </div>
    <div class="creche-list-content">
      <div v-if="user" class="user-info text-center mb-4">
        <h3 class="text-primary"><strong>Bienvenue, {{ user.username }}!</strong></h3>
      </div>

      <!-- Add New Creche button and form -->
      <b-button @click="toggleAddCrecheForm" variant="success" class="mb-3">
        {{ isAddingCreche ? 'Cancel' : '+ Add New Creche' }}
      </b-button>
      <b-form v-if="isAddingCreche" @submit.prevent="handleAddCreche" class="mb-3">
        <b-form-group label="Creche Name" label-for="creche-name">
          <b-form-input
            id="creche-name"
            v-model="newCrecheName"
            required
            placeholder="Enter creche name"
          ></b-form-input>
        </b-form-group>
        <b-button type="submit" variant="primary">Add Creche</b-button>
      </b-form>

      <!-- Export all children button -->
      <b-button @click="exportAllChildren" variant="primary" class="mb-3 export-button">
        Export All Children
      </b-button>

      <!-- Warning message for unauthorized delete -->
      <div v-if="unauthorizedMessage" class="text-warning mb-3">
        <h4 style="color: orange;">{{ unauthorizedMessage }}</h4>
      </div>

      <div class="creche-list">
        <h2 class="text-center mb-4"><strong>Crèches</strong></h2>
        <b-list-group>
          <b-list-group-item v-for="creche in creches" :key="creche.id" class="d-flex justify-content-between align-items-center">
            {{ creche.name }}
            <div class="button-group">
              <b-button :to="'/creche/' + creche.id" variant="info" size="sm" class="action-button">View</b-button>
              <b-button @click="handleRemoveCreche(creche.id)" variant="danger" size="sm" class="action-button">Remove</b-button>
              <b-button @click="exportCrecheChildren(creche.id)" variant="success" size="sm" class="action-button">Export</b-button>
              <b-badge 
                variant="primary" 
                pill 
                class="id-badge"
                tag="router-link"
                :to="{ name: 'Creche', params: { id: creche.id }}"
              >
                {{ creche.id }}
              </b-badge>
            </div>
          </b-list-group-item>
        </b-list-group>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import api from '../services/api'
import '@/assets/css/creche-list.css'  // Import the new CSS file

export default {
  name: 'CrecheListPage',
  setup() {
    const store = useStore()
    const creches = computed(() => store.state.creches)
    const user = computed(() => store.state.user)
    const newCrecheName = ref('')
    const unauthorizedMessage = ref('')
    const isAddingCreche = ref(false)

    onMounted(() => {
      store.dispatch('fetchCreches')
    })

    const toggleAddCrecheForm = () => {
      isAddingCreche.value = !isAddingCreche.value
      newCrecheName.value = ''
    }

    const handleAddCreche = async () => {
      try {
        const response = await api.post('/child-care', { name: newCrecheName.value }, {
          headers: { 'X-Auth': user.value.username }
        })
        store.commit('addCreche', response.data)
        newCrecheName.value = ''
        isAddingCreche.value = false
      } catch (error) {
        console.error('Error adding creche:', error)
        unauthorizedMessage.value = 'An error occurred while trying to add the crèche.'
      }
    }

    const handleRemoveCreche = async (crecheId) => {
      try {
        await api.delete(`/child-care/${crecheId}`, {
          headers: { 'X-Auth': user.value.username }
        })
        store.commit('removeCreche', crecheId)
        unauthorizedMessage.value = ''
      } catch (error) {
        console.error('Error removing creche:', error)
        if (error.response && error.response.status === 403) {
          unauthorizedMessage.value = 'You are not allowed to delete this crèche as you didn\'t create it.'
        } else {
          unauthorizedMessage.value = 'An error occurred while trying to delete the crèche.'
        }
      }
    }

    const exportAllChildren = async () => {
      try {
        const response = await api.get('/children/export.csv', {
          responseType: 'blob',
          headers: { 'X-Auth': user.value.username }
        });

        const blob = new Blob([response.data], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'all_children.csv';
        link.click();
        window.URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error('Error exporting children:', error);
        unauthorizedMessage.value = 'An error occurred while trying to export children data.';
      }
    };

    const exportCrecheChildren = async (crecheId) => {
    try {
        const response = await api.get(`/children/export.csv?childCareId=${crecheId}`, {
        responseType: 'blob',
        headers: { 'X-Auth': user.value.username }
        });

        const blob = new Blob([response.data], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `creche_${crecheId}_children.csv`;
        link.click();
        window.URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error(`Error exporting children for creche ${crecheId}:`, error);
        unauthorizedMessage.value = `An error occurred while trying to export children data for creche ${crecheId}.`;
    }
    };

    return {
      creches,
      user,
      newCrecheName,
      handleAddCreche,
      handleRemoveCreche,
      unauthorizedMessage,
      isAddingCreche,
      toggleAddCrecheForm,
      exportAllChildren,
      exportCrecheChildren
    }
  }
}
</script>