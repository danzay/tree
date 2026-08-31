import axios from 'axios'

export const API_CLIENT = axios.create({
  baseURL: '/api',
  headers: {
    Accept: 'application/json',
  },
  timeout: 10_000,
})
