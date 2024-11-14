import axios from 'axios';
import { BASE_URL } from '../config';
import store from '../store'; // Import your Redux store


const apiClient = axios.create({
  baseURL: BASE_URL,
});


apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token; 
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log(token)
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
