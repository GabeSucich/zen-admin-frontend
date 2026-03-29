<template>
  <div class="todos-page">
    <div class="todos-header">
      <h2>Todos</h2>
      <div class="tab-bar">
        <button class="tab-btn" :class="{ active: activeTab === 'upcoming' }" @click="activeTab = 'upcoming'">Upcoming</button>
        <button class="tab-btn" :class="{ active: activeTab === 'by-client' }" @click="activeTab = 'by-client'">By Client</button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <i class="pi pi-spin pi-spinner" /> Loading todos...
    </div>
    <template v-else>
      <TodosUpcoming v-if="activeTab === 'upcoming'" @complete="openComplete" @change-date="openDateChange" />
      <TodosByClient v-else @complete="openComplete" @change-date="openDateChange" />
    </template>

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
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import DatePicker from 'primevue/datepicker'
import TodosUpcoming from '@/components/TodosUpcoming.vue'
import TodosByClient from '@/components/TodosByClient.vue'
import { TodosService } from '@/api'
import type { TodoResponse } from '@/api'
import { requestWrapper } from '@/api/client'
import { useTodoStore } from '@/stores/todos'

const activeTab = ref<'upcoming' | 'by-client'>('upcoming')
const { loading, loadTodos } = useTodoStore()

function formatDueDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-')
  return `${m}/${d}`
}

function toDateStr(date: Date): string {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
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
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.todos-header h2 {
  margin: 0;
}

.tab-bar {
  display: flex;
  gap: 0;
  border: 1px solid var(--p-surface-200);
  border-radius: 6px;
  overflow: hidden;
}

.tab-btn {
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  border: none;
  background: white;
  color: var(--p-surface-600);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.tab-btn:not(:last-child) {
  border-right: 1px solid var(--p-surface-200);
}

.tab-btn.active {
  background: var(--p-primary-color);
  color: white;
}

.tab-btn:hover:not(.active) {
  background: var(--p-surface-50);
}

.loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--p-surface-500);
  padding: 2rem 0;
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
</style>
