<template>
  <aside class="event-sidebar">
    <div class="sidebar-header">
      Showing meetings from past {{ nextDays - 1 }} day{{ nextDays - 1 === 1 ? '' : 's' }}
    </div>
    <div ref="eventListEl" class="event-list">
      <div
        v-for="event in events"
        :key="event.id"
        class="event-item"
        :class="{ selected: selectedId === event.id }"
        @click="$emit('select', event)"
      >
        <div class="event-title-row">
          <div class="event-title">{{ event.title }}</div>
          <i
            v-if="event.user_confirmed"
            class="pi pi-check-circle event-status-icon confirmed"
          />
          <i
            v-else
            class="pi pi-exclamation-circle event-status-icon unconfirmed"
          />
        </div>
        <span
          v-if="event.meeting_type"
          class="event-meeting-type"
          :style="{ backgroundColor: meetingTypeColor(event.meeting_type) }"
        >{{ event.meeting_type }}</span>
        <div class="event-time">{{ formatDateTime(event.start_time) }}</div>
        <div v-if="event.client" class="event-client">
          <i class="pi pi-user" /> {{ event.client.first_name }} {{ event.client.last_name }}
        </div>
      </div>

      <p v-if="!events.length && !loading" class="empty-text">No events found.</p>
      <div v-if="loading && !events.length" class="loading">
        <i class="pi pi-spin pi-spinner" /> Loading meetings...
      </div>
    </div>

    <div class="sidebar-footer">
      <Button
        :label="`Show meetings from ${nextDays} days ago`"
        icon="pi pi-history"
        severity="secondary"
        text
        size="small"
        :loading="loading"
        @click="$emit('load-more')"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import Button from 'primevue/button'
import type { CalendarEventClientSuggestionResponse } from '@/api'
import { meetingTypeColor } from '@/utils/meetingTypeColors'

const eventListEl = ref<HTMLElement | null>(null)

async function scrollToBottom() {
  await nextTick()
  if (eventListEl.value) {
    eventListEl.value.scrollTop = eventListEl.value.scrollHeight
  }
}

defineExpose({ scrollToBottom })

defineProps<{
  events: CalendarEventClientSuggestionResponse[]
  selectedId: number | null
  nextDays: number
  loading: boolean
}>()

defineEmits<{
  select: [event: CalendarEventClientSuggestionResponse]
  'load-more': []
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
.sidebar-header {
  font-size: 0.75rem;
  color: var(--p-surface-500);
  text-align: center;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--p-surface-200);
}

.event-sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  background: white;
  overflow: hidden;
}

.event-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.event-item {
  padding: 0.625rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid var(--p-surface-100);
}

.event-item:last-child {
  border-bottom: none;
}

.event-item:hover {
  background: var(--p-surface-50);
}

.event-item.selected {
  background: var(--p-surface-100);
  border-left: 3px solid var(--p-primary-color);
  padding-left: calc(0.75rem - 3px);
}

.event-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.event-title {
  font-weight: 600;
  font-size: 0.875rem;
  flex: 1;
  min-width: 0;
}

.event-status-icon {
  font-size: 0.75rem;
  flex-shrink: 0;
  margin-top: 0.15rem;
}

.event-status-icon.confirmed {
  color: var(--p-green-500);
}

.event-status-icon.unconfirmed {
  color: var(--p-yellow-500);
}

.event-meeting-type {
  display: inline-block;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  color: white;
  font-weight: 600;
  font-size: 0.7rem;
  margin-bottom: 0.25rem;
}

.event-time {
  font-size: 0.8rem;
  color: var(--p-surface-500);
}

.event-client {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--p-surface-600);
  margin-top: 0.25rem;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--p-surface-500);
  padding: 2rem 1rem;
}

.empty-text {
  text-align: center;
  color: var(--p-surface-400);
  font-size: 0.875rem;
  padding: 2rem 1rem;
  margin: 0;
}

.sidebar-footer {
  border-top: 1px solid var(--p-surface-200);
  padding: 0.5rem;
  display: flex;
  justify-content: center;
}
</style>
