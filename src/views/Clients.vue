<template>
  <div class="clients-page">
    <div v-if="!confirmedClientsWithCompleteData.length" class="page-header">
      <h2>Clients</h2>
      <Button label="Add Client" icon="pi pi-plus" size="small" @click="openCreate" />
    </div>

    <section v-if="confirmedClientsWithIncompleteData.length" class="incomplete-section">
      <h4><i>Complete profiles for the clients listed below</i></h4>
      <DataTable :value="confirmedClientsWithIncompleteData" stripedRows size="small">
        <Column field="first_name" header="First Name" />
        <Column field="last_name" header="Last Name" />
        <Column field="email" header="Email">
          <template #body="{ data }">
            <span :class="{ missing: !data.email }">{{ data.email || '—' }}</span>
          </template>
        </Column>
        <Column field="phone" header="Phone">
          <template #body="{ data }">
            <span :class="{ missing: !data.phone }">{{ data.phone || '—' }}</span>
          </template>
        </Column>
        <Column field="address" header="Address">
          <template #body="{ data }">
            <span :class="{ missing: !data.address }">{{ data.address || '—' }}</span>
          </template>
        </Column>
        <Column field="location" header="Location">
          <template #body="{ data }">
            <span :class="{ missing: !data.location }">{{ data.location || '—' }}</span>
          </template>
        </Column>
        <Column field="membership_status" header="Membership" />
        <Column field="charm_id" header="Charm ID">
          <template #body="{ data }">
            <span :class="{ missing: !data.charm_id }">{{ data.charm_id || '—' }}</span>
          </template>
        </Column>
        <Column field="notes" header="Notes">
          <template #body="{ data }">
            <span :class="{ missing: !data.notes }">{{ data.notes ? truncate(data.notes) : '—' }}</span>
          </template>
        </Column>
        <Column header="">
          <template #body="{ data }">
            <Button icon="pi pi-pencil" size="small" text @click="openEdit(data)" />
          </template>
        </Column>
      </DataTable>
    </section>

    <section v-if="confirmedClientsWithCompleteData.length" class="complete-section">
      <div class="complete-header">
        <h2>Clients</h2>
        <div class="complete-header-actions">
          <InputText v-model="clientSearch" placeholder="Search by name..." class="client-search" />
          <Button label="Add Client" icon="pi pi-plus" size="small" @click="openCreate" />
        </div>
      </div>
      <DataTable :value="filteredCompleteClients" stripedRows size="small">
        <Column field="first_name" header="First Name" />
        <Column field="last_name" header="Last Name" />
        <Column field="email" header="Email" />
        <Column field="phone" header="Phone" />
        <Column field="address" header="Address" />
        <Column field="location" header="Location" />
        <Column field="membership_status" header="Membership" />
        <Column field="charm_id" header="Charm ID" />
        <Column field="notes" header="Notes">
          <template #body="{ data }">
            {{ data.notes ? truncate(data.notes) : '—' }}
          </template>
        </Column>
        <Column header="">
          <template #body="{ data }">
            <Button icon="pi pi-pencil" size="small" text @click="openEdit(data)" />
          </template>
        </Column>
      </DataTable>
    </section>

    <!-- Edit Dialog -->
    <Dialog
      v-model:visible="showEditDialog"
      header="Edit Client"
      modal
      :style="{ width: '500px' }"
    >
      <div v-if="editForm" class="edit-form">
        <div class="form-row">
          <label>First Name</label>
          <InputText v-model="editForm.first_name" />
        </div>
        <div class="form-row">
          <label>Last Name</label>
          <InputText v-model="editForm.last_name" />
        </div>
        <div class="form-row">
          <label>Email</label>
          <InputText v-model="editForm.email" />
        </div>
        <div class="form-row">
          <label>Phone</label>
          <InputText v-model="editForm.phone" />
        </div>
        <div class="form-row">
          <label>Address</label>
          <InputText v-model="editForm.address" />
        </div>
        <div class="form-row">
          <label>Location</label>
          <Select
            v-model="editForm.location"
            :options="locationOptions"
            placeholder="Select location"
          />
        </div>
        <div class="form-row">
          <label>Membership Status</label>
          <Select
            v-model="editForm.membership_status"
            :options="membershipOptions"
            placeholder="Select status"
          />
        </div>
        <div class="form-row">
          <label>Charm ID</label>
          <InputText v-model="editForm.charm_id" />
        </div>
        <div class="form-row">
          <label>Notes</label>
          <Textarea v-model="editForm.notes" rows="3" autoResize />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="showEditDialog = false" />
        <Button label="Save" :loading="saving" @click="handleSave" />
      </template>
    </Dialog>
    <!-- Create Dialog -->
    <Dialog
      v-model:visible="showCreateDialog"
      header="Add Client"
      modal
      :style="{ width: '500px' }"
    >
      <div class="edit-form">
        <div class="form-row">
          <label>First Name *</label>
          <InputText v-model="createForm.first_name" />
        </div>
        <div class="form-row">
          <label>Last Name *</label>
          <InputText v-model="createForm.last_name" />
        </div>
        <Message v-if="nameMatchWarning" severity="warn" :closable="false" class="form-message">
          {{ nameMatchWarning }}
        </Message>
        <div class="form-row">
          <label>Email</label>
          <InputText v-model="createForm.email" />
        </div>
        <Message v-if="emailDuplicate" severity="error" :closable="false" class="form-message">
          A client with this email already exists.
        </Message>
        <div class="form-row">
          <label>Phone</label>
          <InputText v-model="createForm.phone" />
        </div>
        <div class="form-row">
          <label>Address</label>
          <InputText v-model="createForm.address" />
        </div>
        <div class="form-row">
          <label>Location</label>
          <Select
            v-model="createForm.location"
            :options="locationOptions"
            placeholder="Select location"
          />
        </div>
        <div class="form-row">
          <label>Membership Status</label>
          <Select
            v-model="createForm.membership_status"
            :options="membershipOptions"
            placeholder="Select status"
          />
        </div>
        <div class="form-row">
          <label>Charm ID</label>
          <InputText v-model="createForm.charm_id" />
        </div>
        <div class="form-row">
          <label>Notes</label>
          <Textarea v-model="createForm.notes" rows="3" autoResize />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="showCreateDialog = false" />
        <Button label="Create Client" :loading="creating" :disabled="!canCreate" @click="handleCreate" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import { ClientsService, Location, MembershipStatus } from '@/api'
import type { ClientResponse, UpdateClientRequest, CreateClientRequest } from '@/api'
import { requestWrapper } from '@/api/client'
import { useClientStore } from '@/stores/clients'

const { clients, confirmedClientsWithIncompleteData, confirmedClientsWithCompleteData, loadClients } = useClientStore()

const clientSearch = ref('')

const filteredCompleteClients = computed(() => {
  const query = clientSearch.value.toLowerCase().trim()
  if (!query) return confirmedClientsWithCompleteData.value
  return confirmedClientsWithCompleteData.value.filter((c) =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(query),
  )
})

const showEditDialog = ref(false)
const saving = ref(false)
const editingClientId = ref<number | null>(null)
const editForm = ref<UpdateClientRequest | null>(null)

const locationOptions = Object.values(Location)
const membershipOptions = Object.values(MembershipStatus)

function openEdit(client: ClientResponse) {
  editingClientId.value = client.id
  editForm.value = {
    first_name: client.first_name,
    last_name: client.last_name,
    email: client.email,
    phone: client.phone,
    address: client.address,
    location: client.location,
    membership_status: client.membership_status,
    charm_id: client.charm_id,
    notes: client.notes,
  }
  showEditDialog.value = true
}

async function handleSave() {
  if (!editingClientId.value || !editForm.value) return
  saving.value = true
  try {
    await requestWrapper(
      ClientsService.updateClient(editingClientId.value, editForm.value),
    )
    showEditDialog.value = false
    await loadClients()
  } finally {
    saving.value = false
  }
}

// --- Create ---

const showCreateDialog = ref(false)
const creating = ref(false)
const createForm = ref<CreateClientRequest>({
  first_name: '',
  last_name: '',
})

function openCreate() {
  createForm.value = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    location: undefined,
    membership_status: undefined,
    charm_id: '',
    notes: '',
  }
  showCreateDialog.value = true
}

const nameMatchWarning = computed(() => {
  const first = createForm.value.first_name?.trim().toLowerCase()
  const last = createForm.value.last_name?.trim().toLowerCase()
  if (!first || !last) return null
  const match = clients.value.find(
    (c) => c.first_name.toLowerCase() === first && c.last_name.toLowerCase() === last,
  )
  return match ? `A client named "${match.first_name} ${match.last_name}" already exists.` : null
})

const emailDuplicate = computed(() => {
  const email = createForm.value.email?.trim().toLowerCase()
  if (!email) return false
  return clients.value.some((c) => c.email?.toLowerCase() === email)
})

const canCreate = computed(() => {
  return !!createForm.value.first_name?.trim() && !!createForm.value.last_name?.trim() && !emailDuplicate.value
})

async function handleCreate() {
  if (!canCreate.value) return
  creating.value = true
  try {
    const payload: CreateClientRequest = {
      first_name: createForm.value.first_name.trim(),
      last_name: createForm.value.last_name.trim(),
      email: createForm.value.email?.trim() || undefined,
      phone: createForm.value.phone?.trim() || undefined,
      address: createForm.value.address?.trim() || undefined,
      location: createForm.value.location || undefined,
      membership_status: createForm.value.membership_status || undefined,
      charm_id: createForm.value.charm_id?.trim() || undefined,
      notes: createForm.value.notes?.trim() || undefined,
    }
    await requestWrapper(ClientsService.createClient(payload))
    showCreateDialog.value = false
    await loadClients()
  } finally {
    creating.value = false
  }
}

function truncate(text: string, max = 40): string {
  return text.length > max ? text.slice(0, max) + '...' : text
}
</script>

<style scoped>
.clients-page {
  padding: 1.5rem;
}

.incomplete-section h2,
.complete-section h2 {
  margin: 0 0 1rem;
}

.complete-section {
  margin-top: 2rem;
}

.complete-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.complete-header h2 {
  margin: 0;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.page-header h2 {
  margin: 0;
}

.complete-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.client-search {
  width: 250px;
}

.form-message {
  margin: 0;
}

.missing {
  color: var(--p-surface-400);
  font-style: italic;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-row label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--p-surface-600);
}

.form-row :deep(input),
.form-row :deep(.p-select),
.form-row :deep(textarea) {
  width: 100%;
}
</style>
