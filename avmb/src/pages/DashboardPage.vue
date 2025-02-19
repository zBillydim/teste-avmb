<template>
  <DashboardLayout title="Painel de Controle">
    <q-page class="q-pa-md">
      <div v-if="isAdmin">
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-4">
            <q-card :class="$q.dark.isActive ? 'bg-pink-10' : 'bg-pink-5'">
              <q-card-section>
                <div :class="$q.dark.isActive ? 'text-white' : 'text-black'">
                  <div class="text-h6">Usuários Cadastrados</div>
                  <div class="text-h4">{{ userCount ? userCount : 0 }}</div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-4">
            <q-card :class="$q.dark.isActive ? 'bg-teal-10' : 'bg-teal-5'">
              <q-card-section>
                <div :class="$q.dark.isActive ? 'text-white' : 'text-black'">
                  <div class="text-h6">Acessos Ativos</div>
                  <div class="text-h4">{{ activeAccessCount ? activeAccessCount : 0 }}</div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-4">
            <q-card :class="$q.dark.isActive ? 'bg-orange-10' : 'bg-orange-5'">
              <q-card-section>
                <div :class="$q.dark.isActive ? 'text-white' : 'text-black'">
                  <div class="text-h6">Acessos Prestes a Expirar</div>
                  <div class="text-h4">{{ expiringAccessCount ? expiringAccessCount : 0 }}</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
      <div v-else>
        <q-card :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'">
          <q-card-section>
            <div :class="$q.dark.isActive ? 'text-white' : 'text-black'">
              <div class="text-h6">Acesso Restrito</div>
              <div class="text-h4">Você não tem permissão para visualizar essas informações.</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </q-page>
  </DashboardLayout>
</template>

<script lang="ts">
import DashboardLayout from 'layouts/DashboardLayout.vue'
import { apiWithAuth } from 'src/services/ApiWithAuth'
import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'DashboardPage',
  components: { DashboardLayout },
  setup() {
    const isAdmin = ref(false)
    const userCount = ref(0)
    const activeAccessCount = ref(0)
    const expiringAccessCount = ref(0)

    const fetchUserRole = async () => {
      try {
        const response = await apiWithAuth.get(`/user`)
        if (response.data.user.role === 'admin') {
          isAdmin.value = true
          // faça a busca dos dados dos 3 cards do dashboard
        }
      } catch (error) {
        console.error('Erro ao buscar função do usuário:', error)
      }
    }

    const fetchDashboardData = async () => {
      try {
        const response = await apiWithAuth.get('/dashboard')
        const data = response.data
        userCount.value = data.userCount
        activeAccessCount.value = data.activeAccessCount
        expiringAccessCount.value = data.expiringAccessCount
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error)
      }
    }

    onMounted(async () => {
      await fetchUserRole()
      if (isAdmin.value) {
        await fetchDashboardData()
      }
    })

    return {
      isAdmin,
      userCount,
      activeAccessCount,
      expiringAccessCount,
    }
  },
})
</script>
