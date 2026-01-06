import axios from 'axios'

import { useAuthStore } from './store'

const api = axios.create({
  baseURL: 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export const getWatchlist = async () => {
  return api.get('/watchlist')
}

export const addToWatchlist = async (data: { movieId: string; status?: string; rating?: number; notes?: string }) => {
  return api.post('/watchlist', data)
}

export const removeFromWatchlist = async (id: string) => {
  return api.delete(`/watchlist/${id}`)
}

export const updateWatchlistItem = async (id: string, data: { status?: string; rating?: number; notes?: string }) => {
  return api.put(`/watchlist/${id}`, data)
}

export default api
