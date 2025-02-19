<template>
  <DashboardLayout title="Meus Acessos">
    <q-page class="q-pa-md">
      <h1 class="text-h4 text-center q-mb-md">Meus Acessos</h1>

      <q-table
        :rows="userAccesses"
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
              <q-input
                filled
                v-model="filter"
                placeholder="Pesquisar"
                dense
                :input-class="$q.dark.isActive ? 'text-white' : 'text-black'"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </div>
        </template>
      </q-table>
    </q-page>
  </DashboardLayout>
</template>

<script lang="ts">
import type { QTableColumn } from 'quasar'
import DashboardLayout from 'src/layouts/DashboardLayout.vue'
import { apiWithAuth } from 'src/services/ApiWithAuth'
import Swal from 'sweetalert2'
import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'UserAccessList',
  components: { DashboardLayout },
  setup() {
    const userAccesses = ref([])
    const loading = ref(false)
    const filter = ref('')
    const pagination = ref({
      sortBy: 'resource',
      descending: false,
      page: 1,
      rowsPerPage: 10,
    })

    interface AccessRow {
      id: number
      resource: string
      status: string
    }

    const columns: QTableColumn[] = [
      {
        name: 'resource',
        label: 'Recurso',
        align: 'left',
        field: (row: AccessRow) => row.resource,
        sortable: true,
      },
      {
        name: 'status',
        label: 'Status',
        align: 'left',
        field: (row: AccessRow) => row.status,
        sortable: true,
      },
    ]

    const fetchUserAccesses = async () => {
      try {
        loading.value = true
        const response = await apiWithAuth.get('/user/accesses')
        userAccesses.value = response.data
      } catch (error) {
        console.error(error)
        await Swal.fire({
          title: 'Erro!',
          text: 'Não foi possível carregar os acessos do usuário.',
          icon: 'error',
          confirmButtonText: 'OK',
        })
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      await fetchUserAccesses()
    })

    return {
      userAccesses,
      loading,
      filter,
      pagination,
      columns,
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
