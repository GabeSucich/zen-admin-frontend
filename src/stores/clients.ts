import { reactive, computed, toRefs } from 'vue'
import { ClientsService } from '@/api'
import { requestWrapper } from '@/api/client'
import type { ClientResponse } from '@/api'

const state = reactive({
  clients: [] as ClientResponse[],
})

export function useClientStore() {
  async function loadClients() {
    state.clients = await requestWrapper(ClientsService.getClients())
  }

  const confirmedClients = computed(() =>
    state.clients.filter((c) => c.user_confirmed),
  )

  function isClientComplete(c: ClientResponse): boolean {
    return !!(c.email && c.phone && c.address && c.location && c.charm_id)
  }

  const confirmedClientsWithIncompleteData = computed(() =>
    state.clients.filter((c) => c.user_confirmed && !isClientComplete(c)),
  )

  const confirmedClientsWithCompleteData = computed(() =>
    state.clients.filter((c) => c.user_confirmed && isClientComplete(c)),
  )

  return {
    ...toRefs(state),
    loadClients,
    confirmedClients,
    confirmedClientsWithIncompleteData,
    confirmedClientsWithCompleteData,
  }
}
