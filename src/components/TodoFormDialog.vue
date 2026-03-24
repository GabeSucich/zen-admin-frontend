<template>
  <!-- Create Todo Dialog -->
  <Dialog
    v-model:visible="showCreateDialog"
    header="Add Todo"
    modal
    :style="{ width: '500px' }"
  >
    <div class="edit-form">
      <div class="form-row">
        <label>Title *</label>
        <InputText v-model="createForm.title" />
      </div>
      <div class="form-row">
        <label>Due Date *</label>
        <DatePicker v-model="createForm.due_date" dateFormat="mm/dd/yy" />
      </div>
      <div class="form-row">
        <label>Client</label>
        <div v-if="fixedClient" class="fixed-client">
          <i class="pi pi-user" /> {{ fixedClient.first_name }} {{ fixedClient.last_name }}
        </div>
        <Select
          v-else
          v-model="createForm.client_id"
          :options="clientOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select a client (optional)"
          filter
          autoFilterFocus
          showClear
        />
      </div>
      <MarkdownEditor ref="createNotesEditor" v-model="createForm.notes" />
    </div>
    <template #footer>
      <CreateEditFooter saveLabel="Create Todo" :loading="creating" :disabled="!canCreate" @cancel="showCreateDialog = false" @save="handleCreate" />
    </template>
  </Dialog>

  <!-- Edit Todo Dialog -->
  <Dialog
    v-model:visible="showEditDialog"
    header="Edit Todo"
    modal
    :style="{ width: '500px' }"
  >
    <div v-if="editForm" class="edit-form">
      <div class="form-row">
        <label>Title</label>
        <InputText v-model="editForm.title" />
      </div>
      <div class="form-row">
        <label>Due Date</label>
        <DatePicker v-model="editDueDate" dateFormat="mm/dd/yy" />
      </div>
      <div class="form-row">
        <label>Client</label>
        <div v-if="fixedClient" class="fixed-client">
          <i class="pi pi-user" /> {{ fixedClient.first_name }} {{ fixedClient.last_name }}
        </div>
        <Select
          v-else
          v-model="editForm.client_id"
          :options="clientOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select a client (optional)"
          filter
          autoFilterFocus
          showClear
        />
      </div>
      <MarkdownEditor ref="editNotesEditor" v-model="editForm.notes" />
    </div>
    <template #footer>
      <CreateEditFooter :loading="saving" showDelete @cancel="showEditDialog = false" @save="handleEdit" @delete="showDeleteDialog = true" />
    </template>
  </Dialog>

  <!-- Delete Confirmation Dialog -->
  <Dialog
    v-model:visible="showDeleteDialog"
    header="Delete Todo"
    modal
    :style="{ width: '400px' }"
  >
    <p>Are you sure you want to delete this todo? This cannot be undone.</p>
    <template #footer>
      <Button label="Cancel" severity="secondary" text @click="showDeleteDialog = false" />
      <Button label="Delete" severity="danger" :loading="deleting" @click="handleDelete" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import DatePicker from 'primevue/datepicker'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import CreateEditFooter from '@/components/CreateEditFooter.vue'
import { TodosService, TodoType } from '@/api'
import type { TodoResponse, ClientResponse } from '@/api'
import { requestWrapper } from '@/api/client'
import { useClientStore } from '@/stores/clients'

const props = defineProps<{
  fixedClient?: ClientResponse | null
  calEventClientSuggestionId?: number | null
}>()

const emit = defineEmits<{
  saved: []
  deleted: []
}>()

const createNotesEditor = ref<InstanceType<typeof MarkdownEditor> | null>(null)
const editNotesEditor = ref<InstanceType<typeof MarkdownEditor> | null>(null)
const { confirmedClients } = useClientStore()

const clientOptions = computed(() =>
  confirmedClients.value.map((c) => ({
    label: `${c.first_name} ${c.last_name}`,
    value: c.id,
  })),
)


function toDateStr(date: Date): string {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
}

// --- Create Todo ---

const showCreateDialog = ref(false)
const creating = ref(false)
const createForm = ref({
  title: '',
  todo_type: TodoType.GENERAL,
  due_date: null as Date | null,
  client_id: null as number | null,
  notes: '',
})

const canCreate = computed(() =>
  !!createForm.value.title.trim() && !!createForm.value.due_date,
)

function openCreate() {
  createNotesEditor.value?.resetPreview()
  createForm.value = {
    title: '',
    todo_type: TodoType.GENERAL,
    due_date: null,
    client_id: props.fixedClient?.id ?? null,
    notes: '',
  }
  showCreateDialog.value = true
}

async function handleCreate() {
  if (!canCreate.value || !createForm.value.due_date) return
  createNotesEditor.value?.syncFromDom()
  creating.value = true
  try {
    const clientId = props.fixedClient?.id ?? createForm.value.client_id
    await requestWrapper(
      TodosService.createTodo({
        title: createForm.value.title.trim(),
        todo_type: createForm.value.todo_type,
        due_date: toDateStr(createForm.value.due_date),
        client_id: clientId || undefined,
        cal_event_client_suggestion_id: props.calEventClientSuggestionId ?? undefined,
        notes: createForm.value.notes.trim() || undefined,
      }),
    )
    showCreateDialog.value = false
    emit('saved')
  } finally {
    creating.value = false
  }
}

// --- Edit Todo ---

const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const editingTodoId = ref<number | null>(null)
const editForm = ref<{ title: string; notes: string; client_id: number | null; due_date: string } | null>(null)
const editDueDate = ref<Date | null>(null)

function openEdit(todo: TodoResponse) {
  editNotesEditor.value?.resetPreview()
  editingTodoId.value = todo.id
  editForm.value = {
    title: todo.title,
    notes: todo.notes ?? '',
    client_id: todo.client_id,
    due_date: todo.due_date,
  }
  const [y, m, d] = todo.due_date.split('-').map(Number)
  editDueDate.value = new Date(y!, m! - 1, d)
  showEditDialog.value = true
}

async function handleEdit() {
  if (!editingTodoId.value || !editForm.value) return
  editNotesEditor.value?.syncFromDom()
  saving.value = true
  try {
    const clientId = props.fixedClient?.id ?? editForm.value.client_id
    await requestWrapper(
      TodosService.updateTodo(editingTodoId.value, {
        title: editForm.value.title.trim() || undefined,
        notes: editForm.value.notes.trim() || null,
        client_id: clientId,
        due_date: editDueDate.value ? toDateStr(editDueDate.value) : undefined,
      }),
    )
    showEditDialog.value = false
    emit('saved')
  } finally {
    saving.value = false
  }
}

function openDeleteFromCard(todo: TodoResponse) {
  editingTodoId.value = todo.id
  showDeleteDialog.value = true
}

async function handleDelete() {
  if (!editingTodoId.value) return
  deleting.value = true
  try {
    await requestWrapper(TodosService.deleteTodo(editingTodoId.value))
    showDeleteDialog.value = false
    if (showEditDialog.value) showEditDialog.value = false
    emit('deleted')
  } finally {
    deleting.value = false
  }
}

defineExpose({ openCreate, openEdit, openDeleteFromCard })
</script>

<style scoped>
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
.form-row :deep(textarea),
.form-row :deep(.p-datepicker) {
  width: 100%;
}

.fixed-client {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: var(--p-surface-700);
  padding: 0.5rem 0.75rem;
  background: var(--p-surface-50);
  border-radius: 6px;
}
</style>
