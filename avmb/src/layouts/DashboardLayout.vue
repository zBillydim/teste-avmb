<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated :class="$q.dark.isActive ? 'bg-dark' : 'bg-white text-black'">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="toggleDrawer" />
        <q-toolbar-title class="text-h6">{{ title }}</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawerOpen"
      show-if-above
      side="left"
      bordered
      :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
    >
      <q-list>
        <q-item-label header class="text-h6">Menu</q-item-label>

        <q-expansion-item v-if="isAdmin" expand-separator icon="dashboard" label="Administração">
          <q-item clickable v-ripple to="/dashboard">
            <q-item-section avatar>
              <q-icon name="dashboard" color="pink" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/access">
            <q-item-section avatar>
              <q-icon name="security" color="pink" />
            </q-item-section>
            <q-item-section>Controle de Acessos</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/listaccess">
            <q-item-section avatar>
              <q-icon name="security" color="pink" />
            </q-item-section>
            <q-item-section>Listagem de acessos</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/preapproval">
            <q-item-section avatar>
              <q-icon name="security" color="pink" />
            </q-item-section>
            <q-item-section>Controle de Registros</q-item-section>
          </q-item>
        </q-expansion-item>

        <q-item clickable v-ripple to="/user-access">
          <q-item-section avatar>
            <q-icon name="security" color="pink" />
          </q-item-section>
          <q-item-section>Acessos</q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="logout">
          <q-item-section avatar>
            <q-icon name="logout" color="pink" />
          </q-item-section>
          <q-item-section>Sair</q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="$q.dark.toggle()">
          <q-item-section avatar>
            <q-icon :name="$q.dark.isActive ? 'light_mode' : 'dark_mode'" color="pink" />
          </q-item-section>
          <q-item-section>
            {{ $q.dark.isActive ? 'Modo Claro' : 'Modo Escuro' }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <slot />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { destroyCookie } from 'nookies'
import { apiWithAuth } from 'src/services/ApiWithAuth'
import { defineComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'DashboardLayout',
  props: {
    title: {
      type: String,
      required: false,
      default: 'Dashboard',
    },
  },
  setup() {
    const drawerOpen = ref(false)
    const router = useRouter()
    const isAdmin = ref(false)

    const checkUserRole = async () => {
      try {
        const response = await apiWithAuth.get('/user')
        isAdmin.value = response.data.user.role === 'admin' ? true : false
      } catch (error) {
        console.error('Erro ao verificar o usuário:', error)
      }
    }

    onMounted(async () => {
      await checkUserRole()
    })

    const toggleDrawer = () => {
      drawerOpen.value = !drawerOpen.value
    }

    const logout = async () => {
      destroyCookie(null, 'avmb')
      await router.push('/')
    }

    return {
      drawerOpen,
      toggleDrawer,
      logout,
      isAdmin,
    }
  },
})
</script>

<style scoped>
.bg-dark {
  background-color: #1e1e1e;
}
.bg-white {
  background-color: #ffffff;
}
.text-black {
  color: #000000;
}
</style>
