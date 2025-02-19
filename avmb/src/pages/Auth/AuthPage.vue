<template>
  <q-page class="flex flex-center" :class="$q.dark.isActive ? 'bg-black' : 'bg-white'">
    <div class="q-pa-md" style="max-width: 400px; width: 100%">
      <div class="text-right q-mb-md">
        <q-btn
          round
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          color="pink"
          @click="toggleDarkMode"
          aria-label="Botão para alternar dark/light mode"
        />
      </div>

      <div class="text-center q-mb-sm">
        <div class="text-h5" :class="$q.dark.isActive ? 'text-white' : 'text-black'">
          {{ isRegistering ? 'Cadastro' : 'Login' }}
        </div>
        <br />
      </div>

      <LoginForm v-if="!isRegistering" />
      <RegisterForm v-else />

      <div class="text-center q-mt-lg">
        <span :class="$q.dark.isActive ? 'text-white' : 'text-black'">
          {{ isRegistering ? 'Já tem uma conta?' : 'Não tem uma conta?' }}
        </span>
        <q-btn
          flat
          :label="isRegistering ? 'Login' : 'Cadastre-se'"
          class="q-ml-md"
          color="pink"
          @click="isRegistering = !isRegistering"
          aria-label="Botão para alternar entre login e cadastro"
        />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { parseCookies } from 'nookies'
import { useQuasar } from 'quasar'
import LoginForm from 'src/components/LoginForm.vue'
import RegisterForm from 'src/components/RegisterForm.vue'
import { defineComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'AuthForm',
  components: {
    LoginForm,
    RegisterForm,
  },
  setup() {
    const $q = useQuasar()

    const router = useRouter()
    const isRegistering = ref(false)

    const toggleDarkMode = () => {
      $q.dark.set(!$q.dark.isActive)
    }

    onMounted(async () => {
      const cookies = parseCookies()
      if (cookies.avmb) {
        await router.push('dashboard')
      }
    })

    return {
      isRegistering,
      toggleDarkMode,
    }
  },
})
</script>
