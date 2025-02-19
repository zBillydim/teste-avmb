<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <DashboardLayout title="Painel de Acessos">
    <q-page class="q-pa-md">
      <h1 class="text-h4 text-center q-mb-md">Gerenciamento de Acessos</h1>

      <q-form @submit="onSubmit" class="q-gutter-md">
        <q-select
          filled
          v-model="formData.userId"
          :options="users"
          option-label="label"
          option-value="value"
          label="Selecione um usuário"
          emit-value
          map-options
          :label-color="$q.dark.isActive ? 'white' : 'black'"
          :input-class="$q.dark.isActive ? 'text-white' : 'text-black'"
          :dark="$q.dark.isActive"
        >
          <template v-slot:prepend>
            <q-icon name="person" color="pink" />
          </template>
        </q-select>

        <q-select
          filled
          v-model="formData.resourceId"
          :options="resources"
          option-label="label"
          option-value="value"
          label="Selecione um recurso"
          emit-value
          map-options
          :label-color="$q.dark.isActive ? 'white' : 'black'"
          :input-class="$q.dark.isActive ? 'text-white' : 'text-black'"
          :dark="$q.dark.isActive"
        >
          <template v-slot:prepend>
            <q-icon name="folder" color="pink" />
          </template>
        </q-select>

        <q-select
          filled
          v-model="formData.expirationOption"
          :options="expirationOptions"
          label="Tempo de Expiração"
          :label-color="$q.dark.isActive ? 'white' : 'black'"
          :input-class="$q.dark.isActive ? 'text-white' : 'text-black'"
          :dark="$q.dark.isActive"
          emit-value
          map-options
        >
          <template v-slot:prepend>
            <q-icon name="schedule" color="pink" />
          </template>
        </q-select>

        <q-input
          filled
          v-model.number="formData.customExpirationHours"
          type="number"
          label="Tempo de Expiração Personalizado (horas)"
          :label-color="$q.dark.isActive ? 'white' : 'black'"
          :input-class="$q.dark.isActive ? 'text-white' : 'text-black'"
          :dark="$q.dark.isActive"
          min="1"
          :disabled="formData.expirationOption !== 'custom'"
        >
          <template v-slot:prepend>
            <q-icon name="schedule" color="pink" />
          </template>
        </q-input>

        <div>
          <q-btn label="Conceder Acesso" type="submit" color="pink" class="full-width" size="lg" />
        </div>
      </q-form>
    </q-page>
  </DashboardLayout>
</template>

<script lang="ts">
import type { iUser } from 'src/@types/api-response'
import DashboardLayout from 'src/layouts/DashboardLayout.vue'
import { apiWithAuth } from 'src/services/ApiWithAuth'
import Swal from 'sweetalert2'
import { defineComponent, onMounted, ref } from 'vue'
import * as yup from 'yup'

export default defineComponent({
  name: 'GerenciamentoAcessos',
  components: { DashboardLayout },
  setup() {
    const users = ref([])
    const resources = ref<{ label: string; value: string }[]>([])
    resources.value = [
      { label: 'Documento', value: 'document' },
      { label: 'Área restrita', value: 'internal_zone' },
      { label: 'Sistema interno', value: 'internal_system' },
    ]

    const formData = ref({
      userId: '',
      resourceId: '',
      expirationOption: '24h',
      customExpirationHours: 1,
    })

    const expirationOptions = [
      { label: '24 horas', value: '24h' },
      { label: '7 dias', value: '7d' },
      { label: 'Personalizado', value: 'custom' },
    ]

    const schema = yup.object().shape({
      userId: yup.string().required('Selecione um usuário'),
      resourceId: yup.string().required('Selecione um recurso'),
    })

    onMounted(async () => {
      try {
        const usersResponse = await apiWithAuth.get('/users')
        users.value = usersResponse.data.users.map((user: iUser) => ({
          label: user.name,
          value: user.id,
        }))
      } catch (error) {
        console.error(error)
        await Swal.fire({
          title: 'Erro!',
          text: 'Não foi possível carregar os dados.',
          icon: 'error',
          confirmButtonText: 'OK',
        })
      }
    })

    const onSubmit = async () => {
      try {
        await schema.validate(formData.value)
        const now = new Date()
        let expiresAt: Date

        console.log(formData.value.expirationOption)

        switch (formData.value.expirationOption) {
          case '24h':
            expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
            break
          case '7d':
            expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            break
          case 'custom':
            expiresAt = new Date(
              now.getTime() + formData.value.customExpirationHours * 60 * 60 * 1000,
            )
            break
          default:
            throw new Error('Opção de expiração inválida.')
        }

        await apiWithAuth.post(`/accesses/${formData.value.userId}/grantAccess`, {
          userId: formData.value.userId,
          resource: formData.value.resourceId,
          expiresIn: expiresAt.toISOString(),
        })

        await Swal.fire({
          title: 'Sucesso!',
          text: 'Acesso concedido com sucesso.',
          icon: 'success',
          confirmButtonText: 'OK',
        })

        formData.value = {
          userId: '',
          resourceId: '',
          expirationOption: '24h',
          customExpirationHours: 1,
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(error)
        await Swal.fire({
          title: 'Erro!',
          text: error.message as string,
          icon: 'error',
          confirmButtonText: 'OK',
        })
      }
    }

    return {
      users,
      resources,
      formData,
      expirationOptions,
      onSubmit,
    }
  },
})
</script>

<style scoped>
.q-page {
  max-width: 600px;
  margin: 0 auto;
}
</style>
