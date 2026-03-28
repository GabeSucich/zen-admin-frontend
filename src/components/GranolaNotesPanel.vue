<template>
  <div class="granola-notes-panel">
    <div class="section-header">
      <span class="section-label">Granola Notes</span>
      <Button label="Collapse" size="small" severity="secondary" text @click="$emit('collapse')" />
    </div>

    <div v-if="loading" class="loading">
      <i class="pi pi-spin pi-spinner" /> Loading notes...
    </div>

    <template v-else-if="notes">
      <div v-if="notes.notes_markdown" class="markdown-content" v-html="renderedMarkdown" />
      <div v-else class="plain-content">{{ notes.notes_text }}</div>
    </template>

    <template v-else-if="!notes">
      <div v-if="importing" class="loading">
        <i class="pi pi-spin pi-spinner" /> Sit tight while we try to import Granola notes
      </div>
      <template v-else>
        <p class="empty-text"><em>No Granola notes available yet for this meeting</em></p>
        <Button label="Import Granola Notes" icon="pi pi-download" size="small" @click="importNotes" />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { marked } from 'marked'
import Button from 'primevue/button'
import { MeetingNotesService } from '@/api'
import type { GranolaMeetingNotesResponse } from '@/api'
import { requestWrapper } from '@/api/client'

marked.setOptions({ breaks: true })

const props = defineProps<{
  calendarEventId: number
}>()

const emit = defineEmits<{
  'notes-loaded': [meetingNotesId: number]
  'collapse': []
}>()

const notes = ref<GranolaMeetingNotesResponse | null>(null)
const loading = ref(false)
const importing = ref(false)


const renderedMarkdown = computed(() =>
  notes.value?.notes_markdown ? marked(notes.value.notes_markdown) : '',
)

async function loadNotes() {
  loading.value = true
  notes.value = null
  try {
    const response = await requestWrapper(
      MeetingNotesService.getGranolaNotesForEvent(props.calendarEventId),
    )
    notes.value = (response as any).notes ?? null
    if (notes.value) {
      emit('notes-loaded', notes.value.id)
    }
  } catch {
    // leave notes as null
  } finally {
    loading.value = false
  }
}

async function importNotes() {
  importing.value = true
  try {
    await requestWrapper(MeetingNotesService.ingestGranolaNotes({ days_ago: 7 }))
    await loadNotes()
  } catch {
    // error handled by requestWrapper
  } finally {
    importing.value = false
  }
}

watch(() => props.calendarEventId, () => loadNotes(), { immediate: true })
</script>

<style scoped>
.granola-notes-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 0;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--p-surface-500);
  letter-spacing: 0.025em;
}

.loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--p-surface-500);
  padding: 1rem 0;
}

.markdown-content {
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  background: white;
  font-size: 0.875rem;
  line-height: 1.6;
  overflow-wrap: break-word;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.markdown-content :deep(h1:first-child),
.markdown-content :deep(h2:first-child),
.markdown-content :deep(h3:first-child) {
  margin-top: 0;
}

.markdown-content :deep(p) {
  margin: 0.5rem 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.plain-content {
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  background: white;
  font-size: 0.875rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.empty-text {
  margin: 0;
  font-size: 0.85rem;
  color: var(--p-surface-600);
  line-height: 1.5;
}
</style>
