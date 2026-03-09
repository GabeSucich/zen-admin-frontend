<template>
  <div class="todos-page">
    <div class="todos-header">
      <h2>Todos</h2>
      <Button label="Add Todo" icon="pi pi-plus" size="small" @click="openCreate" />
    </div>

    <section v-if="overdue.length" class="todo-section">
      <h3 class="section-title overdue">Overdue</h3>
      <div class="todo-scroll">
        <div v-for="t in overdue" :key="t.id" class="todo-card overdue">
          <div class="todo-card-top">
            <div class="todo-card-title">{{ t.title }}</div>
            <div class="todo-card-due-row">
              <span class="todo-card-due-badge">{{ formatDueDate(t.due_date) }}</span>
              <Button icon="pi pi-calendar" size="small" text @click="openDateChange(t)" />
            </div>
          </div>
          <div v-if="t.client" class="todo-card-client"><i class="pi pi-user" /> {{ t.client.first_name }} {{ t.client.last_name }}</div>
          <div class="todo-card-meta">
            <Tag :value="t.todo_type" severity="info" />
          </div>
          <p v-if="t.notes" class="todo-card-notes">{{ t.notes }}</p>
          <div class="todo-card-actions">
            <Button icon="pi pi-trash" size="small" severity="danger" text @click="openDeleteFromCard(t)" />
            <div class="todo-card-actions-right">
              <Button label="Edit" size="small" severity="info" outlined @click="openEdit(t)" />
              <Button label="Mark completed" size="small" severity="success" @click="openComplete(t)" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="dueToday.length" class="todo-section">
      <h3 class="section-title today">Due Today</h3>
      <div class="todo-scroll">
        <div v-for="t in dueToday" :key="t.id" class="todo-card today">
          <div class="todo-card-top">
            <div class="todo-card-title">{{ t.title }}</div>
            <div class="todo-card-due-row">
              <span class="todo-card-due-badge">{{ formatDueDate(t.due_date) }}</span>
              <Button icon="pi pi-calendar" size="small" text @click="openDateChange(t)" />
            </div>
          </div>
          <div v-if="t.client" class="todo-card-client"><i class="pi pi-user" /> {{ t.client.first_name }} {{ t.client.last_name }}</div>
          <div class="todo-card-meta">
            <Tag :value="t.todo_type" severity="info" />
          </div>
          <p v-if="t.notes" class="todo-card-notes">{{ t.notes }}</p>
          <div class="todo-card-actions">
            <Button icon="pi pi-trash" size="small" severity="danger" text @click="openDeleteFromCard(t)" />
            <div class="todo-card-actions-right">
              <Button label="Edit" size="small" severity="info" outlined @click="openEdit(t)" />
              <Button label="Mark completed" size="small" severity="success" @click="openComplete(t)" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="dueTomorrow.length" class="todo-section">
      <h3 class="section-title tomorrow">Tomorrow</h3>
      <div class="todo-scroll">
        <div v-for="t in dueTomorrow" :key="t.id" class="todo-card">
          <div class="todo-card-top">
            <div class="todo-card-title">{{ t.title }}</div>
            <div class="todo-card-due-row">
              <span class="todo-card-due-badge">{{ formatDueDate(t.due_date) }}</span>
              <Button icon="pi pi-calendar" size="small" text @click="openDateChange(t)" />
            </div>
          </div>
          <div v-if="t.client" class="todo-card-client"><i class="pi pi-user" /> {{ t.client.first_name }} {{ t.client.last_name }}</div>
          <div class="todo-card-meta">
            <Tag :value="t.todo_type" severity="info" />
          </div>
          <p v-if="t.notes" class="todo-card-notes">{{ t.notes }}</p>
          <div class="todo-card-actions">
            <Button icon="pi pi-trash" size="small" severity="danger" text @click="openDeleteFromCard(t)" />
            <div class="todo-card-actions-right">
              <Button label="Edit" size="small" severity="info" outlined @click="openEdit(t)" />
              <Button label="Mark completed" size="small" severity="success" @click="openComplete(t)" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="dueThisWeek.length" class="todo-section">
      <h3 class="section-title week">This Week</h3>
      <div class="todo-scroll">
        <div v-for="t in dueThisWeek" :key="t.id" class="todo-card">
          <div class="todo-card-top">
            <div class="todo-card-title">{{ t.title }}</div>
            <div class="todo-card-due-row">
              <span class="todo-card-due-badge">{{ formatDueDate(t.due_date) }}</span>
              <Button icon="pi pi-calendar" size="small" text @click="openDateChange(t)" />
            </div>
          </div>
          <div v-if="t.client" class="todo-card-client"><i class="pi pi-user" /> {{ t.client.first_name }} {{ t.client.last_name }}</div>
          <div class="todo-card-meta">
            <Tag :value="t.todo_type" severity="info" />
          </div>
          <p v-if="t.notes" class="todo-card-notes">{{ t.notes }}</p>
          <div class="todo-card-actions">
            <Button icon="pi pi-trash" size="small" severity="danger" text @click="openDeleteFromCard(t)" />
            <div class="todo-card-actions-right">
              <Button label="Edit" size="small" severity="info" outlined @click="openEdit(t)" />
              <Button label="Mark completed" size="small" severity="success" @click="openComplete(t)" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <p v-if="!overdue.length && !dueToday.length && !dueTomorrow.length && !dueThisWeek.length && todos.length === 0" class="empty-text">
      No todos.
    </p>

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
          <label>Todo Type *</label>
          <Select
            v-model="createForm.todo_type"
            :options="todoTypeOptions"
            placeholder="Select todo type"
          />
        </div>
        <div class="form-row">
          <label>Due Date *</label>
          <DatePicker v-model="createForm.due_date" dateFormat="mm/dd/yy" />
        </div>
        <div class="form-row">
          <label>Client</label>
          <Select
            v-model="createForm.client_id"
            :options="clientOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select a client (optional)"
            filter
            showClear
          />
        </div>
        <div class="form-row">
          <label>Notes</label>
          <Textarea v-model="createForm.notes" rows="3" autoResize />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="showCreateDialog = false" />
        <Button label="Create Todo" :loading="creating" :disabled="!canCreate" @click="handleCreate" />
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
          <Select
            v-model="editForm.client_id"
            :options="clientOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select a client (optional)"
            filter
            showClear
          />
        </div>
        <div class="form-row">
          <label>Notes</label>
          <Textarea v-model="editForm.notes" rows="3" autoResize />
        </div>
      </div>
      <template #footer>
        <Button
          label="Delete"
          severity="danger"
          text
          class="delete-button"
          @click="showDeleteDialog = true"
        />
        <Button label="Cancel" severity="secondary" text @click="showEditDialog = false" />
        <Button label="Save" :loading="saving" @click="handleEdit" />
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

    <!-- Mark Complete Confirmation Dialog -->
    <Dialog
      v-model:visible="showCompleteDialog"
      header="Mark Todo Complete"
      modal
      :style="{ width: '400px' }"
    >
      <p v-if="completeTodo">Mark "{{ completeTodo.title }}" as completed?</p>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="showCompleteDialog = false" />
        <Button label="Mark Completed" severity="success" :loading="completing" @click="handleComplete" />
      </template>
    </Dialog>

    <!-- Change Due Date Dialog -->
    <Dialog
      v-model:visible="showDateDialog"
      header="Change Due Date"
      modal
      :style="{ width: '360px' }"
    >
      <div v-if="dateChangeTodo" class="date-change-form">
        <p class="date-change-label">{{ dateChangeTodo.title }}</p>
        <DatePicker v-model="newDueDate" dateFormat="mm/dd/yy" inline />
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="showDateDialog = false" />
        <Button label="Change Due Date" :disabled="!newDueDateChanged" @click="showConfirmDialog = true" />
      </template>
    </Dialog>

    <!-- Confirm Dialog -->
    <Dialog
      v-model:visible="showConfirmDialog"
      header="Confirm Date Change"
      modal
      :style="{ width: '400px' }"
    >
      <p v-if="dateChangeTodo">
        Change due date of "{{ dateChangeTodo.title }}" from
        <b>{{ formatDueDate(dateChangeTodo.due_date) }}</b> to
        <b>{{ newDueDate ? formatDueDate(toDateStr(newDueDate)) : '' }}</b>?
      </p>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="showConfirmDialog = false" />
        <Button label="Confirm" :loading="changingDate" @click="handleChangeDueDate" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import DatePicker from 'primevue/datepicker'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { TodosService, TodoType } from '@/api'
import type { TodoResponse } from '@/api'
import { requestWrapper } from '@/api/client'
import { useClientStore } from '@/stores/clients'
import { useTodoStore } from '@/stores/todos'

const { confirmedClients } = useClientStore()
const { todos, overdue, dueToday, dueTomorrow, dueThisWeek, loadTodos } = useTodoStore()

const clientOptions = computed(() =>
  confirmedClients.value.map((c) => ({
    label: `${c.first_name} ${c.last_name}`,
    value: c.id,
  })),
)

const todoTypeOptions = Object.values(TodoType)

function formatDueDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-')
  return `${m}/${d}`
}

function toDateStr(date: Date): string {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
}

// --- Create Todo ---

const showCreateDialog = ref(false)
const creating = ref(false)
const createForm = ref({
  title: '',
  todo_type: null as TodoType | null,
  due_date: null as Date | null,
  client_id: null as number | null,
  notes: '',
})

const canCreate = computed(() =>
  !!createForm.value.title.trim() && !!createForm.value.todo_type && !!createForm.value.due_date,
)

function openCreate() {
  createForm.value = {
    title: '',
    todo_type: null,
    due_date: null,
    client_id: null,
    notes: '',
  }
  showCreateDialog.value = true
}

async function handleCreate() {
  if (!canCreate.value || !createForm.value.due_date || !createForm.value.todo_type) return
  creating.value = true
  try {
    await requestWrapper(
      TodosService.createTodo({
        title: createForm.value.title.trim(),
        todo_type: createForm.value.todo_type,
        due_date: toDateStr(createForm.value.due_date),
        client_id: createForm.value.client_id || undefined,
        notes: createForm.value.notes.trim() || undefined,
      }),
    )
    showCreateDialog.value = false
    await loadTodos()
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
  saving.value = true
  try {
    await requestWrapper(
      TodosService.updateTodo(editingTodoId.value, {
        title: editForm.value.title.trim() || undefined,
        notes: editForm.value.notes.trim() || undefined,
        client_id: editForm.value.client_id,
        due_date: editDueDate.value ? toDateStr(editDueDate.value) : undefined,
      }),
    )
    showEditDialog.value = false
    await loadTodos()
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
    await loadTodos()
  } finally {
    deleting.value = false
  }
}

// --- Mark Complete ---

const showCompleteDialog = ref(false)
const completing = ref(false)
const completeTodo = ref<TodoResponse | null>(null)

function openComplete(todo: TodoResponse) {
  completeTodo.value = todo
  showCompleteDialog.value = true
}

async function handleComplete() {
  if (!completeTodo.value) return
  completing.value = true
  try {
    await requestWrapper(TodosService.markTodoComplete(completeTodo.value.id))
    showCompleteDialog.value = false
    await loadTodos()
  } finally {
    completing.value = false
  }
}

// --- Change Due Date ---

const showDateDialog = ref(false)
const showConfirmDialog = ref(false)
const changingDate = ref(false)
const dateChangeTodo = ref<TodoResponse | null>(null)
const newDueDate = ref<Date | null>(null)

const newDueDateChanged = computed(() => {
  if (!newDueDate.value || !dateChangeTodo.value) return false
  return toDateStr(newDueDate.value) !== dateChangeTodo.value.due_date
})

function openDateChange(todo: TodoResponse) {
  dateChangeTodo.value = todo
  const [y, m, d] = todo.due_date.split('-').map(Number)
  newDueDate.value = new Date(y!, m! - 1, d)
  showDateDialog.value = true
}

async function handleChangeDueDate() {
  if (!dateChangeTodo.value || !newDueDate.value) return
  changingDate.value = true
  try {
    await requestWrapper(
      TodosService.changeDueDate(dateChangeTodo.value.id, {
        due_date: toDateStr(newDueDate.value),
      }),
    )
    showConfirmDialog.value = false
    showDateDialog.value = false
    await loadTodos()
  } finally {
    changingDate.value = false
  }
}


</script>

<style scoped>
.todos-page {
  padding: 1.5rem;
}

.todos-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.todos-header h2 {
  margin: 0;
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
.form-row :deep(textarea),
.form-row :deep(.p-datepicker) {
  width: 100%;
}

.todo-section {
  margin-bottom: 1.5rem;
}

.section-title {
  margin: 0 0 0.75rem;
  font-size: 1rem;
}

.section-title.overdue {
  color: var(--p-red-500);
}

.section-title.today {
  color: var(--p-primary-color);
}

.todo-scroll {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.todo-card {
  min-width: 260px;
  width: 300px;
  flex-shrink: 0;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.todo-card.overdue {
  border-color: var(--p-red-200);
  background: var(--p-red-50);
}

.todo-card.today {
  border-color: var(--p-primary-200);
  background: var(--p-primary-50);
}

.todo-card-title {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.375rem;
}

.todo-card-client {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8rem;
  color: var(--p-surface-600);
  margin-bottom: 0.375rem;
}

.todo-card-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.todo-card-notes {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  color: var(--p-surface-600);
}

.todo-card-due-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.todo-card-due-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  background: var(--p-primary-color);
  color: white;
  font-weight: 600;
  font-size: 0.75rem;
}

.todo-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.todo-card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.todo-card-actions-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.delete-button {
  margin-right: auto;
}

.date-change-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.date-change-label {
  margin: 0;
  font-weight: 600;
  font-size: 0.9rem;
}

.empty-text {
  color: var(--p-surface-400);
  font-style: italic;
}
</style>
