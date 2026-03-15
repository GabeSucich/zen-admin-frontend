<template>
  <div class="calendar-events-page">
    <section v-if="displayCards.length" class="suggestions-section">
      <h2>Events from your Calendar</h2>
      <div class="suggestions-scroll">
        <div
          v-for="s in displayCards"
          :key="s.id"
          class="suggestion-card"
          :class="{ selected: selected?.id === s.id, confirmed: confirmedSuggestion?.id === s.id }"
          @click="handleCardClick(s)"
        >
          <div class="card-title">{{ s.title }}</div>
          <span
            v-if="s.meeting_type"
            class="card-meeting-type"
            :style="{ backgroundColor: meetingTypeColor(s.meeting_type) }"
          >{{ s.meeting_type }}</span>
          <div class="card-time">{{ formatDateTime(s.start_time) }}</div>
          <span v-if="confirmedSuggestion?.id === s.id" class="card-confirmed-badge">
            <i class="pi pi-check" /> Confirmed
          </span>
        </div>
      </div>
    </section>

    <div v-if="selected" class="detail-columns">
      <!-- Left: Event Info -->
      <div class="detail-panel">
        <h3 class="detail-title">{{ selected.title }}</h3>
        <p class="detail-subtitle">{{ formatDateTime(selected.start_time) }}</p>

        <div class="detail-grid">
          <div class="detail-row">
            <span class="detail-label">Google Calendar</span>
            <a :href="selected.gcal_link" target="_blank" rel="noopener" class="gcal-link">
              <i class="pi pi-external-link" /> Open in Google Calendar
            </a>
          </div>

          <div v-if="selected.description" class="detail-row">
            <span class="detail-label">Description</span>
            <p class="detail-description">{{ selected.description }}</p>
          </div>

          <div v-if="!isAddTodoMode && selected.todos.length" class="detail-row">
            <span class="detail-label">Todos</span>
            <ul class="todo-list">
              <li v-for="todo in selected.todos" :key="todo.id">
                <span class="todo-title">{{ todo.title }}</span>
                <span class="todo-due">Due {{ todo.due_date }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Right: Confirmation Panel (unconfirmed mode) -->
      <div v-if="!isAddTodoMode" class="detail-panel">
        <!-- Meeting Type -->
        <div class="confirm-section">
          <span class="detail-label">Meeting Type</span>
          <div v-if="!changingMeetingType" class="meeting-type-row">
            <span
              v-if="selectedMeetingType"
              class="meeting-type-banner"
              :style="{ backgroundColor: meetingTypeColor(selectedMeetingType) }"
            >
              {{ selectedMeetingType }}
            </span>
            <span v-else class="detail-empty">Not classified</span>
            <Button
              label="Change"
              size="small"
              severity="secondary"
              text
              @click="changingMeetingType = true"
            />
          </div>
          <div v-else class="meeting-type-row">
            <Select
              v-model="selectedMeetingType"
              :options="meetingTypeOptions"
              placeholder="Select meeting type"
              class="meeting-type-select"
            />
            <Button
              label="Done"
              size="small"
              severity="secondary"
              text
              @click="changingMeetingType = false"
            />
          </div>
          <p v-if="selectedMeetingType" class="helper-text">
            <template v-if="selectedTemplateCount > 0">
              {{ selectedTemplateCount }} todo{{ selectedTemplateCount === 1 ? '' : 's' }} will be created from this calendar event.
            </template>
            <template v-else>
              No todos will be created for this event.
            </template>
          </p>
        </div>

        <!-- Client -->
        <div class="confirm-section">
          <span class="detail-label">Suggested Client</span>
          <div v-if="displayClient && !changingClient" class="client-card">
            <div class="client-card-header">
              <div class="client-card-info">
                <div class="client-name-row">
                  <span class="client-name">{{ displayClient.first_name }} {{ displayClient.last_name }}</span>
                  <Tag
                    :value="displayClient.user_confirmed ? 'Existing' : 'New'"
                    :severity="displayClient.user_confirmed ? 'info' : 'success'"
                    class="client-status-tag"
                  />
                </div>
                <div class="client-details">
                  <span v-if="displayClient.email"><i class="pi pi-envelope" /> {{ displayClient.email }}</span>
                  <span v-if="displayClient.phone"><i class="pi pi-phone" /> {{ displayClient.phone }}</span>
                  <span v-if="displayClient.location"><i class="pi pi-map-marker" /> {{ displayClient.location }}</span>
                </div>
              </div>
              <Button
                label="Change"
                size="small"
                severity="secondary"
                text
                @click="changingClient = true"
              />
            </div>
          </div>
          <template v-else>
            <p v-if="!displayClient" class="helper-text">
              No client was matched to this meeting. Select an existing client, or create one in the
              <router-link to="/clients">Clients</router-link> tab and come back here.
            </p>
            <p v-else class="helper-text">
              Select the correct client below. You may need to create the client in the
              <router-link to="/clients">Clients</router-link> tab.
            </p>
            <div class="client-select-row">
              <Select
                v-model="selectedClientId"
                :options="clientOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select a client"
                filter
                class="client-select"
              />
              <Button
                v-if="selected.client"
                label="Reset"
                size="small"
                severity="secondary"
                text
                @click="resetClient"
              />
            </div>
          </template>
        </div>

        <!-- Actions -->
        <div class="action-buttons">
          <Button
            label="Confirm"
            :disabled="!canConfirm"
            :loading="confirming"
            @click="handleConfirm"
          />
          <Button
            label="Ignore"
            severity="secondary"
            outlined
            @click="showIgnoreDialog = true"
          />
        </div>
      </div>

      <!-- Right: Add Todo Panel (confirmed mode) -->
      <div v-else class="detail-panel">
        <div class="add-todo-header">
          <div>
            <span
              class="meeting-type-banner"
              :style="{ backgroundColor: meetingTypeColor(confirmedSuggestion!.meeting_type!) }"
            >
              {{ confirmedSuggestion!.meeting_type }}
            </span>
            <p class="confirmed-client-name">
              <i class="pi pi-user" /> {{ confirmedSuggestion!.client!.first_name }} {{ confirmedSuggestion!.client!.last_name }}
            </p>
          </div>
          <div class="add-todo-buttons">
            <Button label="Add Todo" icon="pi pi-plus" size="small" @click="todoFormDialog?.openCreate()" />
            <Button label="Done" size="small" severity="secondary" @click="requestDone()" />
          </div>
        </div>

        <div v-if="loadingTodos" class="loading-todos">
          <i class="pi pi-spin pi-spinner" /> Refreshing todos...
        </div>
        <div v-else-if="confirmedTodos.length" class="confirmed-todos">
          <TodoCard
            v-for="t in confirmedTodos"
            :key="t.id"
            :todo="t"
            @edit="todoFormDialog?.openEdit($event)"
            @delete="todoFormDialog?.openDeleteFromCard($event)"
          />
        </div>
        <p v-else class="helper-text">No todos yet. Click "Add Todo" to create one.</p>
      </div>
    </div>

    <TodoFormDialog
      ref="todoFormDialog"
      :fixedClient="confirmedSuggestion?.client ?? null"
      :calEventClientSuggestionId="confirmedSuggestion?.id ?? null"
      @saved="handleTodoSaved"
      @deleted="handleTodoSaved"
    />

    <!-- Ignore Dialog -->
    <Dialog
      v-model:visible="showIgnoreDialog"
      header="Ignore calendar event?"
      modal
      :style="{ width: '400px' }"
    >
      <p>No todos will be created based on this event.</p>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="showIgnoreDialog = false" />
        <Button label="Ignore" severity="danger" :loading="ignoring" @click="handleIgnore" />
      </template>
    </Dialog>

    <!-- Done Confirmation Dialog -->
    <Dialog
      v-model:visible="showDoneDialog"
      header="Done adding appointment todos?"
      modal
      :style="{ width: '400px' }"
    >
      <p>Are you done adding todos for this client appointment?</p>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="cancelDone" />
        <Button label="Yes" @click="handleDoneConfirm" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import TodoCard from '@/components/TodoCard.vue'
import TodoFormDialog from '@/components/TodoFormDialog.vue'
import { CalendarSuggestionsService, MeetingType } from '@/api'
import type { CalendarEventClientSuggestionResponse, TodoResponse, ClientResponse } from '@/api'
import { requestWrapper } from '@/api/client'
import { useSuggestionsStore } from '@/stores/suggestions'
import { useMeetingTypesStore } from '@/stores/meetingTypes'
import { useClientStore } from '@/stores/clients'
import { useTodoStore } from '@/stores/todos'
import { meetingTypeColor } from '@/utils/meetingTypeColors'

const router = useRouter()
const { suggestions, loadSuggestions } = useSuggestionsStore()
const { meetingTypes } = useMeetingTypesStore()
const { confirmedClients: rawConfirmedClients, loadClients } = useClientStore()
const { todos, loadTodos } = useTodoStore()

const selected = ref<CalendarEventClientSuggestionResponse | null>(null)
const selectedMeetingType = ref<MeetingType | null>(null)
const selectedClientId = ref<number | null>(null)
const changingMeetingType = ref(false)
const changingClient = ref(false)
const confirming = ref(false)
const showIgnoreDialog = ref(false)
const ignoring = ref(false)
const emailMatchedClient = ref<ClientResponse | null>(null)

// --- Add-todo mode state ---
const confirmedSuggestion = ref<CalendarEventClientSuggestionResponse | null>(null)
const confirmedTodos = ref<TodoResponse[]>([])
const pendingSuggestion = ref<CalendarEventClientSuggestionResponse | null>(null)
const showDoneDialog = ref(false)
const pendingRoute = ref<string | null>(null)
const loadingTodos = ref(false)
const todoFormDialog = ref<InstanceType<typeof TodoFormDialog> | null>(null)

const isAddTodoMode = computed(() => !!confirmedSuggestion.value)

const displayCards = computed(() => {
  if (confirmedSuggestion.value) {
    return [confirmedSuggestion.value, ...suggestions.value]
  }
  return suggestions.value
})

const meetingTypeOptions = computed(() =>
  meetingTypes.value.map((mt) => mt.meeting_type),
)

const clientOptions = computed(() =>
  rawConfirmedClients.value.map((c) => ({
    label: `${c.first_name} ${c.last_name}`,
    value: c.id,
  })),
)

const displayClient = computed(() =>
  emailMatchedClient.value ?? selected.value?.client ?? null,
)

const selectedTemplateCount = computed(() => {
  if (!selectedMeetingType.value) return 0
  const mt = meetingTypes.value.find((m) => m.meeting_type === selectedMeetingType.value)
  return mt?.templates.length ?? 0
})

const canConfirm = computed(() => !!selectedMeetingType.value && !!selectedClientId.value)

function handleCardClick(s: CalendarEventClientSuggestionResponse) {
  if (isAddTodoMode.value) {
    if (s.id === confirmedSuggestion.value!.id) return
    pendingSuggestion.value = s
    showDoneDialog.value = true
    return
  }
  selectSuggestion(s)
}

function resetClient() {
  changingClient.value = false
  if (emailMatchedClient.value) {
    selectedClientId.value = emailMatchedClient.value.id
  } else if (selected.value?.client) {
    selectedClientId.value = selected.value.client.id
  }
}

function selectSuggestion(s: CalendarEventClientSuggestionResponse) {
  selected.value = s
  selectedMeetingType.value = s.meeting_type ?? null
  changingMeetingType.value = false
  changingClient.value = false

  if (s.client && !s.client.user_confirmed && s.client.email) {
    const email = s.client.email.trim().toLowerCase()
    const match = rawConfirmedClients.value.find(
      (c) => c.email && c.email.trim().toLowerCase() === email,
    )
    if (match) {
      emailMatchedClient.value = match
      selectedClientId.value = match.id
      return
    }
  }
  emailMatchedClient.value = null
  selectedClientId.value = s.client?.id ?? null
}

async function handleConfirm() {
  if (!selected.value || !selectedMeetingType.value || !selectedClientId.value) return
  confirming.value = true
  try {
    const replacementClientId =
      selectedClientId.value !== selected.value.client?.id
        ? selectedClientId.value
        : null
    const result = await requestWrapper(
      CalendarSuggestionsService.confirmSuggestion(
        selected.value.id,
        {
          meeting_type: selectedMeetingType.value,
          replacement_client_id: replacementClientId,
        },
      ),
    )
    // Enter add-todo mode
    confirmedSuggestion.value = result
    confirmedTodos.value = []
    selected.value = result
    await loadSuggestions()
    loadClients()
    loadingTodos.value = true
    await loadTodos()
    loadingTodos.value = false
    confirmedTodos.value = todos.value.filter((t) => t.cal_event_client_suggestion_id === result.id)
  } finally {
    confirming.value = false
  }
}

async function handleTodoSaved() {
  await loadTodos()
  if (confirmedSuggestion.value) {
    confirmedTodos.value = todos.value.filter((t) => t.cal_event_client_suggestion_id === confirmedSuggestion.value!.id)
  }
}

function requestDone(pending?: CalendarEventClientSuggestionResponse) {
  pendingSuggestion.value = pending ?? null
  showDoneDialog.value = true
}

function handleDoneConfirm() {
  showDoneDialog.value = false
  const pending = pendingSuggestion.value
  const route = pendingRoute.value
  pendingSuggestion.value = null
  pendingRoute.value = null
  confirmedSuggestion.value = null
  confirmedTodos.value = []
  if (route) {
    router.push(route)
  } else if (pending) {
    selectSuggestion(pending)
  } else {
    selectFirstSuggestion()
  }
}

function cancelDone() {
  showDoneDialog.value = false
  pendingSuggestion.value = null
  pendingRoute.value = null
}

async function handleIgnore() {
  if (!selected.value) return
  ignoring.value = true
  try {
    await requestWrapper(
      CalendarSuggestionsService.deleteCalendarSuggestion(selected.value.id),
    )
    showIgnoreDialog.value = false
    await loadSuggestions()
    selectFirstSuggestion()
  } finally {
    ignoring.value = false
  }
}

function selectFirstSuggestion() {
  if (suggestions.value.length) {
    selectSuggestion(suggestions.value[0]!)
  } else {
    selected.value = null
  }
}

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

onBeforeRouteLeave((to) => {
  if (isAddTodoMode.value) {
    pendingRoute.value = to.fullPath
    showDoneDialog.value = true
    return false
  }
})
</script>

<style scoped>
.calendar-events-page {
  padding: 1.5rem;
}

.suggestions-section h2 {
  margin: 0 0 1rem;
}

.suggestions-scroll {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.suggestion-card {
  min-width: 220px;
  flex-shrink: 0;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s;
}

.suggestion-card:hover {
  border-color: var(--p-primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.suggestion-card.selected {
  border-color: var(--p-primary-color);
  background: var(--p-surface-50);
}

.suggestion-card.confirmed {
  border-color: #16a34a;
  background: #f0fdf4;
}

.suggestion-card.confirmed.selected {
  border-color: #16a34a;
  background: #f0fdf4;
}

.card-title {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.375rem;
}

.card-meeting-type {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  color: white;
  font-weight: 600;
  font-size: 0.75rem;
  margin-bottom: 0.375rem;
}

.card-time {
  font-size: 0.8rem;
  color: var(--p-surface-500);
}

.card-confirmed-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #16a34a;
}

.detail-columns {
  display: flex;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.detail-columns > .detail-panel {
  flex: 1;
  min-width: 0;
}

.detail-panel {
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
}

.detail-title {
  margin: 0 0 0.25rem;
}

.detail-subtitle {
  margin: 0 0 1.25rem;
  color: var(--p-surface-500);
  font-size: 0.9rem;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--p-surface-500);
  letter-spacing: 0.025em;
}

.detail-empty {
  color: var(--p-surface-400);
  font-style: italic;
  font-size: 0.875rem;
}

.detail-description {
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

/* Confirmation panel */
.confirm-section {
  margin-bottom: 1.5rem;
}

.meeting-type-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.meeting-type-banner {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.meeting-type-select {
  flex: 1;
}

.helper-text {
  margin: 0.5rem 0 0.75rem;
  font-size: 0.85rem;
  color: var(--p-surface-600);
  line-height: 1.5;
}

.helper-text a {
  color: var(--p-primary-color);
  text-decoration: none;
  font-weight: 500;
}

.helper-text a:hover {
  text-decoration: underline;
}

.client-card {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: var(--p-surface-50);
  border-radius: 8px;
}

.client-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.client-card-info {
  min-width: 0;
}

.client-name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.client-name {
  font-weight: 600;
  font-size: 0.95rem;
}

.client-status-tag {
  font-size: 0.7rem;
}

.client-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: var(--p-surface-600);
}

.client-details span {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.client-select-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.client-select {
  width: 100%;
  flex: 1;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.action-buttons > * {
  flex: 1;
}

/* Add-todo mode */
.add-todo-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.confirmed-client-name {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin: 0.5rem 0 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--p-surface-700);
}

.add-todo-buttons {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.loading-todos {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--p-surface-500);
  padding: 1rem 0;
}

.confirmed-todos {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.confirmed-todos :deep(.todo-card) {
  width: 100%;
  min-width: 0;
}
</style>
