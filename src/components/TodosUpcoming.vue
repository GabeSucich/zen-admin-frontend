<template>
  <div>
    <div class="upcoming-header">
      <Button label="Add Todo" icon="pi pi-plus" size="small" @click="todoFormDialog?.openCreate()" />
    </div>

    <section v-if="overdue.length" class="todo-section">
      <h3 class="section-title overdue">Overdue</h3>
      <div class="todo-scroll">
        <TodoCard v-for="t in overdue" :key="t.id" :todo="t" variant="overdue" @edit="todoFormDialog?.openEdit($event)" @delete="todoFormDialog?.openDeleteFromCard($event)" @complete="$emit('complete', $event)" @change-date="$emit('change-date', $event)" />
      </div>
    </section>

    <section v-if="dueToday.length" class="todo-section">
      <h3 class="section-title today">Due Today</h3>
      <div class="todo-scroll">
        <TodoCard v-for="t in dueToday" :key="t.id" :todo="t" variant="today" @edit="todoFormDialog?.openEdit($event)" @delete="todoFormDialog?.openDeleteFromCard($event)" @complete="$emit('complete', $event)" @change-date="$emit('change-date', $event)" />
      </div>
    </section>

    <section v-if="dueTomorrow.length" class="todo-section">
      <h3 class="section-title tomorrow">Tomorrow</h3>
      <div class="todo-scroll">
        <TodoCard v-for="t in dueTomorrow" :key="t.id" :todo="t" @edit="todoFormDialog?.openEdit($event)" @delete="todoFormDialog?.openDeleteFromCard($event)" @complete="$emit('complete', $event)" @change-date="$emit('change-date', $event)" />
      </div>
    </section>

    <section v-if="dueThisWeek.length" class="todo-section">
      <h3 class="section-title week">This Week</h3>
      <div class="todo-scroll">
        <TodoCard v-for="t in dueThisWeek" :key="t.id" :todo="t" @edit="todoFormDialog?.openEdit($event)" @delete="todoFormDialog?.openDeleteFromCard($event)" @complete="$emit('complete', $event)" @change-date="$emit('change-date', $event)" />
      </div>
    </section>

    <p v-if="!overdue.length && !dueToday.length && !dueTomorrow.length && !dueThisWeek.length && todos.length === 0" class="empty-text">
      No todos.
    </p>

    <TodoFormDialog ref="todoFormDialog" @saved="loadTodos" @deleted="loadTodos" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import TodoCard from '@/components/TodoCard.vue'
import TodoFormDialog from '@/components/TodoFormDialog.vue'
import type { TodoResponse } from '@/api'
import { useTodoStore } from '@/stores/todos'

defineEmits<{
  complete: [todo: TodoResponse]
  'change-date': [todo: TodoResponse]
}>()

const todoFormDialog = ref<InstanceType<typeof TodoFormDialog> | null>(null)
const { todos, overdue, dueToday, dueTomorrow, dueThisWeek, loadTodos } = useTodoStore()
</script>

<style scoped>
.upcoming-header {
  display: flex;
  margin-bottom: 1rem;
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

.empty-text {
  color: var(--p-surface-400);
  font-style: italic;
}
</style>
