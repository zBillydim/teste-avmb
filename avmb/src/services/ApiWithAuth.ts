import axios from 'axios'
import { parseCookies } from 'nookies'
import { baseURL } from './api'

export const getApiClient = () => {
  const apiWithAuth = axios.create({
    baseURL,
  })
  apiWithAuth.interceptors.request.use((config) => {
    const { avmb: token } = parseCookies()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })
  return apiWithAuth
}

export const apiWithAuth = getApiClient()
