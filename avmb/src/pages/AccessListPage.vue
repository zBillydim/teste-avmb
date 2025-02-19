<template>
  <DashboardLayout title="Listagem de Acessos">
    <q-page class="q-pa-md">
      <h1 class="text-h4 text-center q-mb-md">Acessos</h1>

      <q-table
        :rows="filteredAccessList"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :filter="filter"
        v-model:pagination="pagination"
        class="q-mb-md"
      >
        <template v-slot:top>
          <div class="row q-gutter-sm">
            <div class="col">
              <q-input filled v-model="filter" placeholder="Pesquisar" dense>
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>

            <div class="col">
              <q-select
                filled
                v-model="expirationFilter"
                :options="expirationOptions"
                label="Filtrar por Expiração"
                dense
              />
            </div>
          </div>
        </template>

        <template v-slot:body-cell-expiration="props">
          <q-td :props="props">
            <span :class="getExpirationClass(props.row.expirationTime)">
              {{ formatExpiration(props.row.expirationTime) }}
            </span>
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="getStatusColor(props.row.status)" :label="props.row.status" />
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn color="negative" icon="cancel" dense round @click="revokeAccess(props.row.id)" />
          </q-td>
        </template>
      </q-table>
    </q-page>
  </DashboardLayout>
</template>

<script lang="ts">
import DashboardLayout from 'src/layouts/DashboardLayout.vue'
import { apiWithAuth } from 'src/services/ApiWithAuth'
import Swal from 'sweetalert2'
import { computed, defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'AccessList',
  components: { DashboardLayout },
  setup() {
    const accessList = ref([])
    const loading = ref(false)
    const filter = ref('')
    const pagination = ref({
      sortBy: 'expiration',
      descending: true,
      page: 1,
      rowsPerPage: 10,
    })
    const expirationFilter = ref<'all' | 'expired' | 'not_expired'>('all')

    const expirationOptions = [
      { label: 'Todos', value: 'all' },
      { label: 'Expirados', value: 'expired' },
      { label: 'Não Expirados', value: 'not_expired' },
    ]

    const columns = [
      { name: 'user', label: 'Usuário', align: 'left' as const, field: 'user', sortable: true },
      {
        name: 'resource',
        label: 'Recurso',
        align: 'left' as const,
        field: 'resource',
        sortable: true,
      },
      {
        name: 'expiration',
        label: 'Expira em',
        align: 'left' as const,
        field: 'expiration',
        sortable: true,
      },
      { name: 'status', label: 'Status', align: 'left' as const, field: 'status', sortable: true },
      { name: 'actions', label: 'Ações', align: 'center' as const, field: 'actions' },
    ]

    const fetchAccessList = async () => {
      try {
        loading.value = true
        const response = await apiWithAuth.get('/accesses', {
          params: {
            page: pagination.value.page,
            perPage: pagination.value.rowsPerPage,
            filter: filter.value,
          },
        })
        accessList.value = response.data.accesses
      } catch (error) {
        console.error(error)
        await Swal.fire({
          title: 'Erro!',
          text: 'Não foi possível carregar os acessos.',
          icon: 'error',
          confirmButtonText: 'OK',
        })
      } finally {
        loading.value = false
      }
    }

    const revokeAccess = async (accessId: string) => {
      try {
        await apiWithAuth.post(`/accesses/${accessId}/revokeAccess`)
        await Swal.fire({
          title: 'Sucesso!',
          text: 'Acesso revogado com sucesso.',
          icon: 'success',
          confirmButtonText: 'OK',
        })
        await fetchAccessList()
      } catch (error) {
        console.error(error)
        await Swal.fire({
          title: 'Erro!',
          text: 'Ocorreu um erro ao revogar o acesso.',
          icon: 'error',
          confirmButtonText: 'OK',
        })
      }
    }
    const formatExpiration = (date: string) => {
      const expiration = new Date(date)
      return expiration.toLocaleString('pt-BR', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'active':
          return 'green'
        case 'expired':
          return 'red'
        default:
          return 'grey'
      }
    }

    const getExpirationClass = (date: string) => {
      const now = new Date()
      const expiration = new Date(date)
      const diffMs = expiration.getTime() - now.getTime()
      return diffMs <= 3600000 ? 'text-negative' : ''
    }

    const filteredAccessList = computed(() => {
      const now = new Date().toLocaleString()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return accessList.value.filter((access: any) => {
        const expiration = new Date(access.expirationTime).toLocaleString()
        const isExpired = new Date(expiration).getTime() < new Date(now).getTime()
        if (expirationFilter.value === 'expired') {
          return isExpired
        } else if (expirationFilter.value === 'not_expired') {
          return !isExpired
        }
        return true
      })
    })

    onMounted(fetchAccessList)

    return {
      accessList,
      loading,
      filter,
      pagination,
      expirationFilter,
      expirationOptions,
      columns,
      revokeAccess,
      formatExpiration,
      getExpirationClass,
      filteredAccessList,
      getStatusColor,
    }
  },
})
</script>

<style scoped>
.q-page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
