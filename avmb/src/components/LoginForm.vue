<template>
  <q-form @submit="onSubmit" class="q-gutter-md">
    <q-input
      filled
      v-model="formData.email"
      label="E-mail"
      :label-color="$q.dark.isActive ? 'white' : 'black'"
      :input-class="$q.dark.isActive ? 'text-white' : 'text-black'"
      :dark="$q.dark.isActive"
    >
      <template v-slot:prepend>
        <q-icon name="person" color="pink" />
      </template>
    </q-input>

    <q-input
      filled
      type="password"
      v-model="formData.password"
      label="Senha"
      :label-color="$q.dark.isActive ? 'white' : 'black'"
      :input-class="$q.dark.isActive ? 'text-white' : 'text-black'"
      :dark="$q.dark.isActive"
    >
      <template v-slot:prepend>
        <q-icon name="lock" color="pink" />
      </template>
    </q-input>

    <div>
      <q-btn label="Entrar" type="submit" color="pink" class="full-width" size="lg" />
    </div>

    <div class="text-center q-mt-md">
      <q-btn
        flat
        label="Esqueceu a senha?"
        :color="$q.dark.isActive ? 'white' : 'black'"
        @click="$emit('forgot-password')"
      />
    </div>
  </q-form>
</template>

<script lang="ts">
import { parseCookies } from 'nookies'
import { useAuth } from 'src/hooks/useAuthForm'
import Swal from 'sweetalert2'
import { defineComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as yup from 'yup'

export default defineComponent({
  name: 'LoginForm',
  setup() {
    const { signIn } = useAuth()
    const formData = ref({
      email: '',
      password: '',
    })

    const router = useRouter()

    const schema = yup.object().shape({
      email: yup.string().email('E-mail inválido').required('Campo obrigatório'),
      password: yup.string().required('Campo obrigatório'),
    })

    onMounted(async () => {
      const { avmb: token } = parseCookies()
      if (token) {
        await router.push('/dashboard')
      }
    })

    const onSubmit = async () => {
      try {
        await schema.validate(formData.value, { abortEarly: false })
        await signIn(formData.value)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        await Swal.fire({
          title: 'Erro!',
          text: 'Ocorreu um erro durante o login.',
          icon: 'error',
          confirmButtonText: 'OK',
        })
      }
    }

    return {
      formData,
      onSubmit,
    }
  },
})
</script>
