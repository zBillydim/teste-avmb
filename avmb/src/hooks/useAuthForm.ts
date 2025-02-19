/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { destroyCookie, parseCookies, setCookie } from 'nookies'
import type { iSignup, iUser, iUserResponse } from 'src/@types/api-response'
import { api } from 'src/services/api'
import { apiWithAuth } from 'src/services/ApiWithAuth'
import Swal from 'sweetalert2'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface SignInData {
  email: string
  password: string
}

export const getUserData = async (
  userRef: { value: iUser | null },
  isAuthenticatedRef: { value: boolean },
) => {
  const { avmb: token } = parseCookies()
  if (token) {
    try {
      const response = await apiWithAuth.get<iUserResponse>('user')
      if (response.status === 200) {
        console.log(response.data)
        userRef.value = response.data.user
        isAuthenticatedRef.value = true
      }
    } catch (error) {
      userRef.value = null
      isAuthenticatedRef.value = false
      console.error('Failed to fetch user data:', error)
    }
  }
}

export function useAuth() {
  const isAuthenticated = ref(false)
  const errors = ref<Record<string, string> | null>(null)
  const user = ref<iUser | null>(null)
  const router = useRouter()

  const signIn = async (data: SignInData) => {
    try {
      const response = await api.post<iUserResponse>('login', data)
      if (response.status === 200) {
        const { token, user: userData } = response.data
        if (userData.status === 'pre-register') {
          await Swal.fire({
            title: 'Erro!',
            text: 'Usuário não ativado. Aguarde um Admin ativar sua conta.',
            icon: 'error',
            confirmButtonText: 'OK',
          })
          return
        }
        setCookie(undefined, 'avmb', token, { path: '/' })
        void router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Sign-in error:', error)
      const errorMessage = error?.response?.data?.error || 'Erro desconhecido'

      await Swal.fire({
        title: 'Erro!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK',
      })
    }
  }

  const register = async (data: iSignup) => {
    try {
      const { name, email, password } = data
      const response = await api.post<iUserResponse>('register', { name, email, password })
      if (response.status === 201) {
        const { token, user: userData } = response.data
        setCookie(undefined, 'avmb', token, { path: '/' })
        await getUserData(user, isAuthenticated)
        await router.push('/dashboard')
      }
    } catch (error: unknown) {
      console.error('Sign-in error:', error)
    }
  }

  const logout = () => {
    destroyCookie(undefined, 'avmb')
    user.value = null
    isAuthenticated.value = false
    console.log('User logged out.')
  }

  return {
    user,
    isAuthenticated,
    errors,
    signIn,
    register,
    logout,
  }
}
