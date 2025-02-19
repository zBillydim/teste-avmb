<template>
  <DashboardLayout title="Aprovação de Cadastros">
    <q-page class="q-pa-md">
      <h1 class="text-h4 text-center q-mb-md">Aprovação de Cadastros</h1>

      <q-table
        :rows="pendingUsers"
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
            <div class="col">
              <q-select
                filled
                v-model="selectedStatus"
                :options="statusOptions"
                label="Selecione o status"
                dense
                :input-class="$q.dark.isActive ? 'text-white' : 'text-black'"
              >
                <template v-slot:prepend>
                  <q-icon name="filter_alt" color="pink" />
                </template>
              </q-select>
            </div>
          </div>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              color="positive"
              icon="check"
              dense
              round
              @click="approveUser(props.row.id)"
              class="q-mr-sm"
            />
            <q-btn color="negative" icon="close" dense round @click="rejectUser(props.row.id)" />
          </q-td>
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
import { defineComponent, onMounted, ref, watch } from 'vue'

export default defineComponent({
  name: 'UserApproval',
  components: { DashboardLayout },
  setup() {
    const pendingUsers = ref([])
    const loading = ref(false)
    const filter = ref('')
    const pagination = ref({
      sortBy: 'name',
      descending: false,
      page: 1,
      rowsPerPage: 10,
    })
    const selectedStatus = ref({ label: 'Pré-registro', value: 'pre-register' })
    const statusOptions = [
      { label: 'Pré-registro', value: 'pre-register' },
      { label: 'Inativo', value: 'inactive' },
    ]

    interface UserRow {
      id: number
      name: string
      email: string
      status: string
    }

    const columns: QTableColumn[] = [
      {
        name: 'name',
        label: 'Nome',
        align: 'left',
        field: (row: UserRow) => row.name,
        sortable: true,
      },
      {
        name: 'email',
        label: 'E-mail',
        align: 'left',
        field: (row: UserRow) => row.email,
        sortable: true,
      },
      {
        name: 'status',
        label: 'Status',
        align: 'left',
        field: (row: UserRow) => row.status,
        sortable: true,
      },
      {
        name: 'actions',
        label: 'Ações',
        align: 'center',
        field: 'actions',
      },
    ]

    const fetchPendingUsers = async () => {
      try {
        loading.value = true
        const response = await apiWithAuth.get(`/user/pending?status=${selectedStatus.value.value}`)
        pendingUsers.value = response.data
      } catch (error) {
        console.error(error)
        await Swal.fire({
          title: 'Erro!',
          text: 'Não foi possível carregar os usuários pendentes.',
          icon: 'error',
          confirmButtonText: 'OK',
        })
      } finally {
        loading.value = false
      }
    }

    watch(selectedStatus, async () => {
      console.log(selectedStatus.value.value)
      await fetchPendingUsers()
    })

    const approveUser = async (userId: number) => {
      try {
        await apiWithAuth.patch(`/user/${userId}/status`, {
          action: 'active',
        })
        await Swal.fire({
          title: 'Sucesso!',
          text: 'Usuário aprovado com sucesso.',
          icon: 'success',
          confirmButtonText: 'OK',
        })
        await fetchPendingUsers()
      } catch (error) {
        console.error(error)
        await Swal.fire({
          title: 'Erro!',
          text: 'Ocorreu um erro ao aprovar o usuário.',
          icon: 'error',
          confirmButtonText: 'OK',
        })
      }
    }

    const rejectUser = async (userId: number) => {
      try {
        await apiWithAuth.post(`/user/${userId}/status`, {
          action: 'inactive',
        })
        await Swal.fire({
          title: 'Sucesso!',
          text: 'Usuário rejeitado com sucesso.',
          icon: 'success',
          confirmButtonText: 'OK',
        })
        await fetchPendingUsers()
      } catch (error) {
        console.error(error)
        await Swal.fire({
          title: 'Erro!',
          text: 'Ocorreu um erro ao rejeitar o usuário.',
          icon: 'error',
          confirmButtonText: 'OK',
        })
      }
    }

    onMounted(async () => {
      await fetchPendingUsers()
    })

    return {
      pendingUsers,
      loading,
      filter,
      pagination,
      columns,
      selectedStatus,
      statusOptions,
      approveUser,
      rejectUser,
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
