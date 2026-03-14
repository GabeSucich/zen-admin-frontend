<template>
  <div class="templates-page">
    <h2>Todo Templates</h2>

    <div class="meeting-type-tabs">
      <button
        v-for="mt in meetingTypes"
        :key="mt.meeting_type"
        class="meeting-type-btn"
        :class="{ active: selectedType === mt.meeting_type }"
        :style="{
          '--mt-color': meetingTypeColor(mt.meeting_type),
        }"
        @click="selectedType = mt.meeting_type"
      >
        {{ mt.meeting_type }} ({{ mt.templates.length }})
      </button>
    </div>

    <div v-if="selectedType" class="templates-header">
      <h3>{{ selectedType }}</h3>
      <Button
        label="Add Template"
        icon="pi pi-plus"
        size="small"
        @click="openCreate"
      />
    </div>

    <p v-if="selectedType && !selectedTemplates.length" class="empty-text">
      No templates for this meeting type.
    </p>

    <div v-if="selectedTemplates.length" class="template-cards">
      <div v-for="t in selectedTemplates" :key="t.id" class="template-card">
        <div class="template-card-header">
          <div class="template-card-title-group">
            <span class="template-card-title">{{ t.title }}</span>
            <span class="template-card-due">Due {{ t.days_until_due }} day{{ t.days_until_due === 1 ? '' : 's' }} after event</span>
          </div>
          <Button label="Edit" size="small" severity="info" outlined @click="openEdit(t)" />
          <Badge :value="t.order" severity="secondary" />
        </div>
        <div class="template-card-meta">
          <Tag :value="t.todo_type" severity="info" />
        </div>
        <div v-if="t.notes" class="template-card-notes" v-html="marked(t.notes)" />
      </div>
    </div>

    <!-- Create Dialog -->
    <Dialog
      v-model:visible="showCreateDialog"
      :header="`Add ${selectedType} Template`"
      modal
      :style="{ width: '500px' }"
    >
      <div class="edit-form">
        <div class="form-row">
          <label>Title</label>
          <InputText v-model="createForm.title" />
        </div>
        <MarkdownEditor ref="createNotesEditor" v-model="createForm.notes" />
        <div class="form-row">
          <label>Todo Type</label>
          <Select
            v-model="createForm.todo_type"
            :options="todoTypeOptions"
            placeholder="Select todo type"
          />
        </div>
        <div class="form-row">
          <label>Days Until Due</label>
          <InputNumber v-model="createForm.days_until_due" :min="0" />
        </div>
        <div class="form-row">
          <label>Order</label>
          <InputNumber v-model="createForm.order" :min="0" />
        </div>
      </div>
      <template #footer>
        <CreateEditFooter saveLabel="Create Template" :loading="saving" :disabled="!canSaveCreate" @cancel="showCreateDialog = false" @save="handleCreate" />
      </template>
    </Dialog>

    <!-- Edit Dialog -->
    <Dialog
      v-model:visible="showEditDialog"
      :header="`Edit ${selectedType} Template`"
      modal
      :style="{ width: '500px' }"
    >
      <div v-if="editForm" class="edit-form">
        <div class="form-row">
          <label>Title</label>
          <InputText v-model="editForm.title" />
        </div>
        <MarkdownEditor ref="editNotesEditor" v-model="editForm.notes" />
        <div class="form-row">
          <label>Days Until Due</label>
          <InputNumber v-model="editForm.days_until_due" :min="0" />
        </div>
        <div class="form-row">
          <label>Order</label>
          <InputNumber v-model="editForm.order" :min="0" />
        </div>
      </div>
      <template #footer>
        <CreateEditFooter :loading="saving" :disabled="!canSaveEdit" showDelete @cancel="showEditDialog = false" @save="handleEdit" @delete="showDeleteDialog = true" />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="showDeleteDialog"
      header="Delete Template"
      modal
      :style="{ width: '400px' }"
    >
      <p>Are you sure you want to delete this template? This cannot be undone.</p>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="showDeleteDialog = false" />
        <Button label="Delete" severity="danger" :loading="deleting" @click="handleDelete" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import Badge from 'primevue/badge'
import { marked } from 'marked'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import CreateEditFooter from '@/components/CreateEditFooter.vue'

marked.setOptions({ breaks: true })
import { MeetingTypeTodoTemplatesService, MeetingType, TodoType } from '@/api'
import type { MeetingTypeTodoTemplateResponse, UpdateMeetingTypeTodoTemplateRequest } from '@/api'
import { requestWrapper } from '@/api/client'
import { useMeetingTypesStore } from '@/stores/meetingTypes'

const { meetingTypes, loadMeetingTypes } = useMeetingTypesStore()

import { meetingTypeColor } from '@/utils/meetingTypeColors'

const selectedType = ref<MeetingType | null>(null)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const createNotesEditor = ref<InstanceType<typeof MarkdownEditor> | null>(null)
const editNotesEditor = ref<InstanceType<typeof MarkdownEditor> | null>(null)

const todoTypeOptions = Object.values(TodoType)

const selectedTemplates = computed(() => {
  if (!selectedType.value) return []
  const mt = meetingTypes.value.find((m) => m.meeting_type === selectedType.value)
  return [...(mt?.templates ?? [])].sort((a, b) => a.order - b.order)
})

// --- Create ---

const createForm = ref({
  title: '',
  notes: '',
  todo_type: null as TodoType | null,
  days_until_due: 0,
  order: 0,
})

const canSaveCreate = computed(() =>
  !!createForm.value.title && !!createForm.value.todo_type,
)

function openCreate() {
  createNotesEditor.value?.resetPreview()
  createForm.value = {
    title: '',
    notes: '',
    todo_type: null,
    days_until_due: 1,
    order: selectedTemplates.value.length
      ? Math.max(...selectedTemplates.value.map((t) => t.order)) + 1
      : 1,
  }
  showCreateDialog.value = true
}

async function handleCreate() {
  if (!selectedType.value || !createForm.value.todo_type) return
  createNotesEditor.value?.syncFromDom()
  saving.value = true
  try {
    await requestWrapper(
      MeetingTypeTodoTemplatesService.createTemplate({
        meeting_type: selectedType.value,
        todo_type: createForm.value.todo_type,
        title: createForm.value.title,
        notes: createForm.value.notes,
        days_until_due: createForm.value.days_until_due,
        order: createForm.value.order,
      }),
    )
    showCreateDialog.value = false
    await loadMeetingTypes()
  } finally {
    saving.value = false
  }
}

// --- Edit ---

const editingTemplateId = ref<number | null>(null)
const editForm = ref<UpdateMeetingTypeTodoTemplateRequest | null>(null)

const canSaveEdit = computed(() => !!editForm.value?.title)

function openEdit(template: MeetingTypeTodoTemplateResponse) {
  editNotesEditor.value?.resetPreview()
  editingTemplateId.value = template.id
  editForm.value = {
    title: template.title,
    notes: template.notes,
    days_until_due: template.days_until_due,
    order: template.order,
  }
  showEditDialog.value = true
}

async function handleEdit() {
  if (!editingTemplateId.value || !editForm.value) return
  editNotesEditor.value?.syncFromDom()
  saving.value = true
  try {
    await requestWrapper(
      MeetingTypeTodoTemplatesService.updateTemplate(editingTemplateId.value, editForm.value),
    )
    showEditDialog.value = false
    await loadMeetingTypes()
  } finally {
    saving.value = false
  }
}

// --- Delete ---

async function handleDelete() {
  if (!editingTemplateId.value) return
  deleting.value = true
  try {
    await requestWrapper(
      MeetingTypeTodoTemplatesService.deleteTemplate(editingTemplateId.value),
    )
    showDeleteDialog.value = false
    showEditDialog.value = false
    await loadMeetingTypes()
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.templates-page {
  padding: 1.5rem;
}

.templates-page h2 {
  margin: 0 0 1rem;
}

.meeting-type-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.meeting-type-btn {
  padding: 0.375rem 0.75rem;
  border: 2px solid var(--mt-color);
  border-radius: 6px;
  background: white;
  color: var(--mt-color);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.meeting-type-btn:hover {
  background: var(--mt-color);
  color: white;
}

.meeting-type-btn.active {
  background: var(--mt-color);
  color: white;
}

.templates-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.templates-header h3 {
  margin: 0;
}

.empty-text {
  color: var(--p-surface-400);
  font-style: italic;
}

.template-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.template-card {
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  padding: 1rem;
  background: white;
}

.template-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.template-card-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.template-card-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.template-card-title-group {
  flex: 1;
  min-width: 0;
}

.template-card-due {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--p-surface-600);
  margin-top: 0.125rem;
}

.template-card-notes {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: var(--p-surface-600);
}

.template-card-notes :deep(p) {
  margin: 0 0 0.5rem;
}

.template-card-notes :deep(p:last-child) {
  margin-bottom: 0;
}

.template-card-notes :deep(ul),
.template-card-notes :deep(ol) {
  margin: 0 0 0.5rem;
  padding-left: 1.25rem;
}

.template-card-notes :deep(code) {
  background: var(--p-surface-100);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-size: 0.8rem;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-row label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--p-surface-600);
}

.form-row :deep(input),
.form-row :deep(.p-select),
.form-row :deep(textarea),
.form-row :deep(.p-inputnumber) {
  width: 100%;
}

</style>
