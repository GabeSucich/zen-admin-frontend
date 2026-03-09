<template>
  <div>
    <div class="by-client-header">
      <Select
        v-model="selectedClientId"
        :options="clientOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Select a client"
        filter
        showClear
        class="client-select"
      />
      <Button v-if="selectedClientId" label="Add Todo" icon="pi pi-plus" size="small" @click="todoFormDialog?.openCreate()" />
    </div>

    <template v-if="selectedClient">
      <section v-if="clientOverdue.length" class="todo-section">
        <h3 class="section-title overdue">Overdue</h3>
        <div class="todo-grid">
          <TodoCard v-for="t in clientOverdue" :key="t.id" :todo="t" variant="overdue" @edit="todoFormDialog?.openEdit($event)" @delete="todoFormDialog?.openDeleteFromCard($event)" @complete="$emit('complete', $event)" @change-date="$emit('change-date', $event)" />
        </div>
      </section>

      <section v-if="clientDueToday.length" class="todo-section">
        <h3 class="section-title today">Due Today</h3>
        <div class="todo-grid">
          <TodoCard v-for="t in clientDueToday" :key="t.id" :todo="t" variant="today" @edit="todoFormDialog?.openEdit($event)" @delete="todoFormDialog?.openDeleteFromCard($event)" @complete="$emit('complete', $event)" @change-date="$emit('change-date', $event)" />
        </div>
      </section>

      <section v-if="clientDueTomorrow.length" class="todo-section">
        <h3 class="section-title tomorrow">Tomorrow</h3>
        <div class="todo-grid">
          <TodoCard v-for="t in clientDueTomorrow" :key="t.id" :todo="t" @edit="todoFormDialog?.openEdit($event)" @delete="todoFormDialog?.openDeleteFromCard($event)" @complete="$emit('complete', $event)" @change-date="$emit('change-date', $event)" />
        </div>
      </section>

      <section v-if="clientDueThisWeek.length" class="todo-section">
        <h3 class="section-title week">This Week</h3>
        <div class="todo-grid">
          <TodoCard v-for="t in clientDueThisWeek" :key="t.id" :todo="t" @edit="todoFormDialog?.openEdit($event)" @delete="todoFormDialog?.openDeleteFromCard($event)" @complete="$emit('complete', $event)" @change-date="$emit('change-date', $event)" />
        </div>
      </section>

      <section v-if="clientDueLater.length" class="todo-section">
        <h3 class="section-title">Later</h3>
        <div class="todo-grid">
          <TodoCard v-for="t in clientDueLater" :key="t.id" :todo="t" @edit="todoFormDialog?.openEdit($event)" @delete="todoFormDialog?.openDeleteFromCard($event)" @complete="$emit('complete', $event)" @change-date="$emit('change-date', $event)" />
        </div>
      </section>

      <p v-if="clientTodos.length === 0" class="empty-text">
        No todos for {{ selectedClient.first_name }} {{ selectedClient.last_name }}.
      </p>
    </template>

    <p v-else class="empty-text">Select a client to view their todos.</p>

    <TodoFormDialog ref="todoFormDialog" :fixedClient="selectedClient" @saved="loadTodos" @deleted="loadTodos" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import Select from 'primevue/select'
import TodoCard from '@/components/TodoCard.vue'
import TodoFormDialog from '@/components/TodoFormDialog.vue'
import type { TodoResponse } from '@/api'
import { useClientStore } from '@/stores/clients'
import { useTodoStore } from '@/stores/todos'

defineEmits<{
  complete: [todo: TodoResponse]
  'change-date': [todo: TodoResponse]
}>()

const todoFormDialog = ref<InstanceType<typeof TodoFormDialog> | null>(null)
const { confirmedClients } = useClientStore()
const { todos, loadTodos } = useTodoStore()

const selectedClientId = ref<number | null>(null)

const clientOptions = computed(() =>
  confirmedClients.value.map((c) => ({
    label: `${c.first_name} ${c.last_name}`,
    value: c.id,
  })),
)

const selectedClient = computed(() => {
  if (!selectedClientId.value) return null
  return confirmedClients.value.find((c) => c.id === selectedClientId.value) ?? null
})

function todayStr(): string {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

const clientTodos = computed(() =>
  todos.value.filter((t) => t.client_id === selectedClientId.value),
)

const clientOverdue = computed(() => {
  const today = todayStr()
  return clientTodos.value.filter((t) => t.due_date < today)
})

const clientDueToday = computed(() => {
  const today = todayStr()
  return clientTodos.value.filter((t) => t.due_date === today)
})

const clientDueTomorrow = computed(() => {
  const tomorrow = addDays(todayStr(), 1)
  return clientTodos.value.filter((t) => t.due_date === tomorrow)
})

const clientDueThisWeek = computed(() => {
  const tomorrow = addDays(todayStr(), 1)
  const weekEnd = addDays(todayStr(), 7)
  return clientTodos.value.filter((t) => t.due_date > tomorrow && t.due_date <= weekEnd)
})

const clientDueLater = computed(() => {
  const weekEnd = addDays(todayStr(), 7)
  return clientTodos.value.filter((t) => t.due_date > weekEnd)
})
</script>

<style scoped>
.by-client-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.client-select {
  width: 320px;
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

.todo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.empty-text {
  color: var(--p-surface-400);
  font-style: italic;
}
</style>
