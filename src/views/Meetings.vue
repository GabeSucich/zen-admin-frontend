<template>
  <div class="calendar-events-2">
    <EventSidebar
      ref="sidebar"
      :events="events"
      :selectedId="selected?.id ?? null"
      :nextDays="daysAgo + 1"
      :loading="loading"
      @select="selected = $event; meetingNotesId = null"
      @load-more="loadMore"
    />

    <div v-if="selected" class="main-content">
      <template v-if="!selected.user_confirmed">
        <div class="detail-columns">
          <EventInfoPanel :suggestion="selected" />
          <EventConfirmPanel
            :suggestion="selected"
            @confirmed="handleConfirmed"
            @ignored="handleIgnored"
          />
        </div>
      </template>
      <template v-else>
        <div class="confirmed-columns">
          <EventTodosPanel :suggestion="selected" :meetingNotesId="meetingNotesId" />
          <GranolaNotesPanel :calendarEventId="selected.calendar_event_id" @notes-loaded="meetingNotesId = $event" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import EventSidebar from '@/components/EventSidebar.vue'
import EventInfoPanel from '@/components/EventInfoPanel.vue'
import EventConfirmPanel from '@/components/EventConfirmPanel.vue'
import EventTodosPanel from '@/components/EventTodosPanel.vue'
import GranolaNotesPanel from '@/components/GranolaNotesPanel.vue'
import { CalendarSuggestionsService } from '@/api'
import type { CalendarEventClientSuggestionResponse } from '@/api'
import { requestWrapper } from '@/api/client'
import { useClientStore } from '@/stores/clients'
import { useSuggestionsStore } from '@/stores/suggestions'

const { loadClients } = useClientStore()
const { loadSuggestions } = useSuggestionsStore()

const sidebar = ref<InstanceType<typeof EventSidebar> | null>(null)
const events = ref<CalendarEventClientSuggestionResponse[]>([])
const selected = ref<CalendarEventClientSuggestionResponse | null>(null)
const daysAgo = ref(3)
const loading = ref(false)
const meetingNotesId = ref<number | null>(null)

function sinceTimestamp(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

async function fetchEvents() {
  loading.value = true
  try {
    const result = await requestWrapper(
      CalendarSuggestionsService.getAllSuggestions(sinceTimestamp(daysAgo.value)),
    )
    // Most recent first
    events.value = [...result].reverse()
  } catch {
    // error handled by requestWrapper
  } finally {
    loading.value = false
  }
}

async function handleConfirmed(result: CalendarEventClientSuggestionResponse) {
  await fetchEvents()
  // Update selected to the refreshed version
  selected.value = events.value.find((e) => e.id === result.id) ?? result
  loadSuggestions()
  loadClients()
}

async function handleIgnored() {
  const ignoredIdx = events.value.findIndex((e) => e.id === selected.value?.id)
  await fetchEvents()
  loadSuggestions()
  // Select the next event after the ignored one, or the last one, or clear
  if (events.value.length) {
    const nextIdx = Math.min(ignoredIdx, events.value.length - 1)
    selected.value = events.value[nextIdx]!
  } else {
    selected.value = null
  }
}

async function loadMore() {
  daysAgo.value++
  await fetchEvents()
  sidebar.value?.scrollToBottom()
}

onMounted(() => fetchEvents())
</script>

<style scoped>
.calendar-events-2 {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  height: calc(100vh - 80px);
}

.main-content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
}

.detail-columns {
  display: flex;
  gap: 1.5rem;
}

.detail-columns > * {
  flex: 1;
  min-width: 0;
}

.confirmed-columns {
  display: flex;
  gap: 1.5rem;
}

.confirmed-columns > * {
  flex: 1;
  min-width: 0;
}
</style>
