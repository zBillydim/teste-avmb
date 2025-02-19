<template>
  <q-form @submit.prevent="onSubmit" class="q-gutter-md">
    <q-input
      filled
      v-model="formData.name"
      label="Nome"
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
      v-model="formData.email"
      label="E-mail"
      :label-color="$q.dark.isActive ? 'white' : 'black'"
      :input-class="$q.dark.isActive ? 'text-white' : 'text-black'"
      :dark="$q.dark.isActive"
    >
      <template v-slot:prepend>
        <q-icon name="email" color="pink" />
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

    <q-input
      filled
      type="password"
      v-model="formData.confirmPassword"
      label="Confirmar Senha"
      :label-color="$q.dark.isActive ? 'white' : 'black'"
      :input-class="$q.dark.isActive ? 'text-white' : 'text-black'"
      :dark="$q.dark.isActive"
    >
      <template v-slot:prepend>
        <q-icon name="lock" color="pink" />
      </template>
    </q-input>

    <div>
      <q-btn
        label="Cadastrar"
        type="submit"
        color="pink"
        class="full-width"
        size="lg"
        aria-label="Botão para cadastrar"
      />
    </div>
  </q-form>
</template>

<script lang="ts">
import { useAuth } from 'src/hooks/useAuthForm'
import Swal from 'sweetalert2'
import { defineComponent, ref } from 'vue'
import * as yup from 'yup'

export default defineComponent({
  name: 'RegisterForm',
  setup() {
    const { register } = useAuth()
    const formData = ref({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    })

    const schema = yup.object().shape({
      name: yup.string().required('Nome é obrigatório'),
      email: yup.string().email('E-mail inválido').required('Campo obrigatório'),
      password: yup
        .string()
        .min(6, 'A senha deve ter pelo menos 6 caracteres')
        .required('Campo obrigatório'),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], 'As senhas não coincidem')
        .required('Campo obrigatório'),
    })

    const onSubmit = async () => {
      try {
        await schema.validate(formData.value, { abortEarly: false })
        await register(formData.value)
        await Swal.fire({
          title: 'Sucesso!',
          text: 'Cadastro realizado com sucesso.',
          icon: 'success',
          confirmButtonText: 'OK',
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        await Swal.fire({
          title: 'Erro!',
          text: 'Ocorreu um erro durante o cadastro.',
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
