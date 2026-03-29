import { reactive, computed, toRefs } from 'vue'
import { TodosService } from '@/api'
import { requestWrapper } from '@/api/client'
import type { TodoResponse } from '@/api'

function todayStr(): string {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

const state = reactive({
  todos: [] as TodoResponse[],
  loading: false,
})

export function useTodoStore() {
  async function loadTodos() {
    state.loading = true
    try {
      state.todos = await requestWrapper(
        TodosService.getConfirmedTodos(undefined, false),
      )
    } finally {
      state.loading = false
    }
  }

  const overdue = computed(() => {
    const today = todayStr()
    return state.todos.filter((t) => t.due_date < today)
  })

  const dueToday = computed(() => {
    const today = todayStr()
    return state.todos.filter((t) => t.due_date === today)
  })

  const dueTomorrow = computed(() => {
    const tomorrow = addDays(todayStr(), 1)
    return state.todos.filter((t) => t.due_date === tomorrow)
  })

  const dueThisWeek = computed(() => {
    const tomorrow = addDays(todayStr(), 1)
    const weekEnd = addDays(todayStr(), 7)
    return state.todos.filter((t) => t.due_date > tomorrow && t.due_date <= weekEnd)
  })

  const upcomingCount = computed(() =>
    overdue.value.length + dueToday.value.length + dueTomorrow.value.length + dueThisWeek.value.length,
  )

  return {
    ...toRefs(state),
    loadTodos,
    overdue,
    dueToday,
    dueTomorrow,
    dueThisWeek,
    upcomingCount,
  }
}
