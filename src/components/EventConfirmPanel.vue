<template>
  <div class="confirm-panel">
    <!-- Meeting Type -->
    <div class="confirm-section">
      <span class="section-label">Meeting Type</span>
      <div v-if="!changingMeetingType" class="meeting-type-row">
        <span
          v-if="selectedMeetingType"
          class="meeting-type-banner"
          :style="{ backgroundColor: meetingTypeColor(selectedMeetingType) }"
        >
          {{ selectedMeetingType }}
        </span>
        <span v-else class="empty-value">Not classified</span>
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
      <span class="section-label">Suggested Client</span>
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
            v-if="suggestion.client"
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
import { ref, computed, watch } from 'vue'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import { CalendarSuggestionsService, MeetingType } from '@/api'
import type { CalendarEventClientSuggestionResponse, ClientResponse } from '@/api'
import { requestWrapper } from '@/api/client'
import { useMeetingTypesStore } from '@/stores/meetingTypes'
import { useClientStore } from '@/stores/clients'
import { meetingTypeColor } from '@/utils/meetingTypeColors'

const props = defineProps<{
  suggestion: CalendarEventClientSuggestionResponse
}>()

const emit = defineEmits<{
  confirmed: [result: CalendarEventClientSuggestionResponse]
  ignored: []
}>()

const { meetingTypes } = useMeetingTypesStore()
const { confirmedClients: rawConfirmedClients } = useClientStore()

const selectedMeetingType = ref<MeetingType | null>(null)
const selectedClientId = ref<number | null>(null)
const changingMeetingType = ref(false)
const changingClient = ref(false)
const confirming = ref(false)
const showIgnoreDialog = ref(false)
const ignoring = ref(false)
const emailMatchedClient = ref<ClientResponse | null>(null)

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
  emailMatchedClient.value ?? props.suggestion.client ?? null,
)

const selectedTemplateCount = computed(() => {
  if (!selectedMeetingType.value) return 0
  const mt = meetingTypes.value.find((m) => m.meeting_type === selectedMeetingType.value)
  return mt?.templates.length ?? 0
})

const canConfirm = computed(() => !!selectedMeetingType.value && !!selectedClientId.value)

// Reset state when a new suggestion is selected
watch(() => props.suggestion.id, () => {
  selectedMeetingType.value = props.suggestion.meeting_type ?? null
  changingMeetingType.value = false
  changingClient.value = false

  if (props.suggestion.client && !props.suggestion.client.user_confirmed && props.suggestion.client.email) {
    const email = props.suggestion.client.email.trim().toLowerCase()
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
  selectedClientId.value = props.suggestion.client?.id ?? null
}, { immediate: true })

function resetClient() {
  changingClient.value = false
  if (emailMatchedClient.value) {
    selectedClientId.value = emailMatchedClient.value.id
  } else if (props.suggestion.client) {
    selectedClientId.value = props.suggestion.client.id
  }
}

async function handleConfirm() {
  if (!selectedMeetingType.value || !selectedClientId.value) return
  confirming.value = true
  try {
    const replacementClientId =
      selectedClientId.value !== props.suggestion.client?.id
        ? selectedClientId.value
        : null
    const result = await requestWrapper(
      CalendarSuggestionsService.confirmSuggestion(
        props.suggestion.id,
        {
          meeting_type: selectedMeetingType.value,
          replacement_client_id: replacementClientId,
        },
      ),
    )
    emit('confirmed', result)
  } finally {
    confirming.value = false
  }
}

async function handleIgnore() {
  ignoring.value = true
  try {
    await requestWrapper(
      CalendarSuggestionsService.deleteCalendarSuggestion(props.suggestion.id),
    )
    showIgnoreDialog.value = false
    emit('ignored')
  } finally {
    ignoring.value = false
  }
}
</script>

<style scoped>
.confirm-panel {
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
}

.confirm-section {
  margin-bottom: 1.5rem;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--p-surface-500);
  letter-spacing: 0.025em;
}

.empty-value {
  color: var(--p-surface-400);
  font-style: italic;
  font-size: 0.875rem;
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
</style>
