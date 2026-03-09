<template>
  <div class="calendar-events-page">
    <section v-if="suggestions.length" class="suggestions-section">
      <h2>Events from your Calendar</h2>
      <div class="suggestions-scroll">
        <div
          v-for="s in suggestions"
          :key="s.id"
          class="suggestion-card"
          :class="{ selected: selected?.id === s.id }"
          @click="selectSuggestion(s)"
        >
          <div class="card-title">{{ s.title }}</div>
          <span
            v-if="s.meeting_type"
            class="card-meeting-type"
            :style="{ backgroundColor: meetingTypeColor(s.meeting_type) }"
          >{{ s.meeting_type }}</span>
          <div class="card-time">{{ formatDateTime(s.start_time) }}</div>
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

          <div v-if="selected.todos.length" class="detail-row">
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

      <!-- Right: Confirmation Panel -->
      <div class="detail-panel">
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
          <div v-if="selected.client && !changingClient" class="client-card">
            <div class="client-card-header">
              <div class="client-card-info">
                <div class="client-name-row">
                  <span class="client-name">{{ selected.client.first_name }} {{ selected.client.last_name }}</span>
                  <Tag
                    :value="selected.client.user_confirmed ? 'Existing' : 'New'"
                    :severity="selected.client.user_confirmed ? 'info' : 'success'"
                    class="client-status-tag"
                  />
                </div>
                <div class="client-details">
                  <span v-if="selected.client.email"><i class="pi pi-envelope" /> {{ selected.client.email }}</span>
                  <span v-if="selected.client.phone"><i class="pi pi-phone" /> {{ selected.client.phone }}</span>
                  <span v-if="selected.client.location"><i class="pi pi-map-marker" /> {{ selected.client.location }}</span>
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
            <p v-if="!selected.client" class="helper-text">
              No client was matched to this meeting. Select an existing client, or create one in the
              <router-link to="/clients">Clients</router-link> tab and come back here.
            </p>
            <p v-else class="helper-text">
              Select the correct client below. You may need to create the client in the
              <router-link to="/clients">Clients</router-link> tab.
            </p>
            <Select
              v-model="selectedClientId"
              :options="clientOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select a client"
              filter
              class="client-select"
            />
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
    </div>

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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import { CalendarSuggestionsService, MeetingType } from '@/api'
import type { CalendarEventClientSuggestionResponse } from '@/api'
import { requestWrapper } from '@/api/client'
import { useSuggestionsStore } from '@/stores/suggestions'
import { useMeetingTypesStore } from '@/stores/meetingTypes'
import { useClientStore } from '@/stores/clients'
import { useTodoStore } from '@/stores/todos'

const { suggestions, loadSuggestions } = useSuggestionsStore()
const { meetingTypes } = useMeetingTypesStore()
const { confirmedClients: rawConfirmedClients, loadClients } = useClientStore()
const { loadTodos } = useTodoStore()

const selected = ref<CalendarEventClientSuggestionResponse | null>(null)
const selectedMeetingType = ref<MeetingType | null>(null)
const selectedClientId = ref<number | null>(null)
const changingMeetingType = ref(false)
const changingClient = ref(false)
const confirming = ref(false)
const showIgnoreDialog = ref(false)
const ignoring = ref(false)

const meetingTypeOptions = computed(() =>
  meetingTypes.value.map((mt) => mt.meeting_type),
)

const clientOptions = computed(() =>
  rawConfirmedClients.value.map((c) => ({
    label: `${c.first_name} ${c.last_name}`,
    value: c.id,
  })),
)

const selectedTemplateCount = computed(() => {
  if (!selectedMeetingType.value) return 0
  const mt = meetingTypes.value.find((m) => m.meeting_type === selectedMeetingType.value)
  return mt?.templates.length ?? 0
})

const canConfirm = computed(() => !!selectedMeetingType.value && !!selectedClientId.value)

function selectSuggestion(s: CalendarEventClientSuggestionResponse) {
  selected.value = s
  selectedMeetingType.value = s.meeting_type ?? null
  selectedClientId.value = s.client?.id ?? null
  changingMeetingType.value = false
  changingClient.value = false
}

import { meetingTypeColor } from '@/utils/meetingTypeColors'

async function handleConfirm() {
  if (!selected.value || !selectedMeetingType.value || !selectedClientId.value) return
  confirming.value = true
  try {
    const replacementClientId =
      selectedClientId.value !== selected.value.client?.id
        ? selectedClientId.value
        : null
    await requestWrapper(
      CalendarSuggestionsService.confirmSuggestion(
        selected.value.id,
        {
          meeting_type: selectedMeetingType.value,
          replacement_client_id: replacementClientId,
        },
      ),
    )
    await loadSuggestions()
    loadClients()
    loadTodos()
    selectFirstSuggestion()
  } finally {
    confirming.value = false
  }
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

.client-select {
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.action-buttons > * {
  flex: 1;
}
</style>
