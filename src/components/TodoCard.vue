<template>
  <div class="todo-card" :class="variant">
    <div class="todo-card-top">
      <div class="todo-card-title">{{ todo.title }}</div>
      <div class="todo-card-due-row">
        <span class="todo-card-due-badge">{{ formatDueDate(todo.due_date) }}</span>
        <Button icon="pi pi-calendar" size="small" text @click="$emit('change-date', todo)" />
      </div>
    </div>
    <div v-if="todo.client" class="todo-card-client"><i class="pi pi-user" /> {{ todo.client.first_name }} {{ todo.client.last_name }}</div>
    <hr v-if="todo.notes" class="todo-card-divider" />
    <div v-if="todo.notes" class="todo-card-notes" v-html="marked(todo.notes)" />
    <div class="todo-card-actions">
      <Button icon="pi pi-trash" size="small" severity="danger" text @click="$emit('delete', todo)" />
      <div class="todo-card-actions-right">
        <Button label="Edit" size="small" severity="info" outlined @click="$emit('edit', todo)" />
        <Button label="Mark completed" size="small" severity="success" class="mark-completed-btn" @click="$emit('complete', todo)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import { marked } from 'marked'
import type { TodoResponse } from '@/api'

marked.setOptions({ breaks: true })

defineProps<{
  todo: TodoResponse
  variant?: 'overdue' | 'today'
}>()

defineEmits<{
  edit: [todo: TodoResponse]
  delete: [todo: TodoResponse]
  complete: [todo: TodoResponse]
  'change-date': [todo: TodoResponse]
}>()

function formatDueDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-')
  return `${m}/${d}`
}
</script>

<style scoped>
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

.todo-card-divider {
  border: none;
  border-top: 1px solid var(--p-surface-200);
  margin: 0.5rem 0 0;
}

.todo-card-notes {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  color: var(--p-surface-600);
}

.todo-card-notes :deep(p) {
  margin: 0 0 0.5rem;
}

.todo-card-notes :deep(p:last-child) {
  margin-bottom: 0;
}

.todo-card-notes :deep(ul),
.todo-card-notes :deep(ol) {
  margin: 0 0 0.5rem;
  padding-left: 1.25rem;
}

.todo-card-notes :deep(code) {
  background: var(--p-surface-100);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-size: 0.75rem;
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
  background: #3b82f6;
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
  margin-top: auto;
  padding-top: 0.5rem;
}

.todo-card-actions-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mark-completed-btn :deep(.p-button),
.mark-completed-btn {
  background: #16a34a;
  border-color: #16a34a;
}

.mark-completed-btn:hover {
  background: #15803d;
  border-color: #15803d;
}
</style>
