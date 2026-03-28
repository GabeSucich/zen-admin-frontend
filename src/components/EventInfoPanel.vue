<template>
  <div class="info-panel">
    <h3 class="info-title">{{ suggestion.title }}</h3>
    <p class="info-subtitle">{{ formatDateTime(suggestion.start_time) }}</p>

    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">Google Calendar</span>
        <a :href="suggestion.gcal_link" target="_blank" rel="noopener" class="gcal-link">
          <i class="pi pi-external-link" /> Open in Google Calendar
        </a>
      </div>

      <div v-if="suggestion.description" class="info-row">
        <span class="info-label">Description</span>
        <p class="info-description">{{ suggestion.description }}</p>
      </div>

      <div v-if="suggestion.todos.length" class="info-row">
        <span class="info-label">Todos</span>
        <ul class="todo-list">
          <li v-for="todo in suggestion.todos" :key="todo.id">
            <span class="todo-title">{{ todo.title }}</span>
            <span class="todo-due">Due {{ todo.due_date }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CalendarEventClientSuggestionResponse } from '@/api'

defineProps<{
  suggestion: CalendarEventClientSuggestionResponse
}>()

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
.info-panel {
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
}

.info-title {
  margin: 0 0 0.25rem;
}

.info-subtitle {
  margin: 0 0 1.25rem;
  color: var(--p-surface-500);
  font-size: 0.9rem;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--p-surface-500);
  letter-spacing: 0.025em;
}

.info-description {
  margin: 0;
  white-space: pre-wrap;
  font-size: 0.875rem;
}

.gcal-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--p-primary-color);
  text-decoration: none;
  font-size: 0.875rem;
}

.gcal-link:hover {
  text-decoration: underline;
}

.todo-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.todo-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: var(--p-surface-50);
  border-radius: 6px;
  font-size: 0.875rem;
}

.todo-title {
  font-weight: 500;
}

.todo-due {
  color: var(--p-surface-500);
  font-size: 0.8rem;
}
</style>
