<template>
  <div class="todos-panel">
    <div class="todos-header">
      <h3 class="todos-title">{{ suggestion.title }}</h3>
      <p class="todos-subtitle">{{ formatDateTime(suggestion.start_time) }}</p>
    </div>

    <div class="todos-toolbar">
      <span class="todos-section-label">Todos</span>
      <div class="todos-toolbar-buttons">
        <Button
          v-if="meetingNotesId && !actionItems.length"
          label="Suggest Granola Todos"
          icon="pi pi-sparkles"
          size="small"
          severity="success"
          :loading="loadingActionItems"
          @click="fetchActionItems"
        />
        <Button label="Add Todo" icon="pi pi-plus" size="small" @click="todoFormDialog?.openCreate()" />
      </div>
    </div>

    <div v-if="actionItems.length" class="action-items-section">
      <span class="todos-section-label">Suggested from Granola</span>
      <div class="action-items-list">
        <div v-for="(item, idx) in actionItems" :key="idx" class="action-item-card">
          <div class="action-item-content">
            <p class="action-item-title">{{ item.title }}</p>
            <p v-if="item.description" class="action-item-desc">{{ item.description }}</p>
          </div>
          <div class="action-item-actions">
            <Button icon="pi pi-plus" size="small" rounded text @click="createFromActionItem(item)" />
            <Button icon="pi pi-times" size="small" rounded text severity="secondary" @click="dismissActionItem(idx)" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="loadingTodos" class="loading-todos">
      <i class="pi pi-spin pi-spinner" /> Loading todos...
    </div>
    <div v-else-if="todos.length" class="todos-list">
      <TodoCard
        v-for="t in todos"
        :key="t.id"
        :todo="t"
        @edit="todoFormDialog?.openEdit($event)"
        @delete="todoFormDialog?.openDeleteFromCard($event)"
        @complete="handleComplete($event)"
      />
    </div>
    <p v-else class="empty-text">No todos yet. Click "Add Todo" to create one.</p>

    <TodoFormDialog
      ref="todoFormDialog"
      :fixedClient="suggestion.client ?? null"
      :calEventClientSuggestionId="suggestion.id"
      @saved="refreshTodos"
      @deleted="refreshTodos"
    />
  </div>

</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Button from 'primevue/button'
import TodoCard from '@/components/TodoCard.vue'
import TodoFormDialog from '@/components/TodoFormDialog.vue'
import { TodosService, MeetingNotesService } from '@/api'
import type { CalendarEventClientSuggestionResponse, TodoResponse, ActionItem } from '@/api'
import { requestWrapper } from '@/api/client'
import { useTodoStore } from '@/stores/todos'

const props = defineProps<{
  suggestion: CalendarEventClientSuggestionResponse
  meetingNotesId?: number | null
}>()

const { todos: allTodos, loadTodos } = useTodoStore()

const todoFormDialog = ref<InstanceType<typeof TodoFormDialog> | null>(null)
const todos = ref<TodoResponse[]>([])
const loadingTodos = ref(false)

async function refreshTodos() {
  loadingTodos.value = true
  await loadTodos()
  todos.value = allTodos.value.filter(
    (t) => t.cal_event_client_suggestion_id === props.suggestion.id,
  )
  loadingTodos.value = false
}

async function handleComplete(todo: TodoResponse) {
  await requestWrapper(TodosService.markTodoComplete(todo.id))
  refreshTodos()
}

const actionItems = ref<ActionItem[]>([])
const loadingActionItems = ref(false)

async function fetchActionItems() {
  if (!props.meetingNotesId) return
  loadingActionItems.value = true
  try {
    const result = await requestWrapper(
      MeetingNotesService.getGranolaActionItems(props.meetingNotesId),
    )
    actionItems.value = result.action_items
  } catch {
    // error handled by requestWrapper
  } finally {
    loadingActionItems.value = false
  }
}

function createFromActionItem(item: ActionItem) {
  todoFormDialog.value?.openCreateWith({
    title: item.title,
    notes: item.description,
  })
}

function dismissActionItem(idx: number) {
  actionItems.value.splice(idx, 1)
}

watch(() => props.suggestion.id, () => {
  actionItems.value = []
  refreshTodos()
}, { immediate: true })

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.todos-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.todos-header {
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
}

.todos-title {
  margin: 0 0 0.25rem;
}

.todos-subtitle {
  margin: 0;
  color: var(--p-surface-500);
  font-size: 0.9rem;
}

.todos-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.todos-section-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--p-surface-500);
  letter-spacing: 0.025em;
}

.loading-todos {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--p-surface-500);
  padding: 1rem 0;
}

.todos-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.todos-list :deep(.todo-card) {
  width: 100%;
  min-width: 0;
}

.empty-text {
  margin: 0;
  font-size: 0.85rem;
  color: var(--p-surface-600);
  line-height: 1.5;
}

.todos-toolbar-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-items-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.action-items-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-item-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  border: 1px dashed var(--p-surface-300);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  background: var(--p-surface-50);
}

.action-item-content {
  flex: 1;
  min-width: 0;
}

.action-item-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--p-surface-800);
}

.action-item-desc {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: var(--p-surface-600);
  line-height: 1.4;
}

.action-item-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}
</style>
