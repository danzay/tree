import axios from 'axios'

export const API_CLIENT = axios.create({
  baseURL: '/api',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
  timeout: 10_000,
})
