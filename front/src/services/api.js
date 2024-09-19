import axios from 'axios'
import store from '../store' // adjust the path as needed

const api = axios.create({
  baseURL: 'http://localhost:3000'
})

api.interceptors.request.use(config => {
  const user = store.state.user
  if (user) {
    config.headers['X-Auth'] = user.username
  }
  return config
})

export default api