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
          <span class="template-card-title">{{ t.title }}</span>
          <Button icon="pi pi-pencil" size="small" text @click="openEdit(t)" />
        </div>
        <div class="template-card-meta">
          <Tag :value="t.todo_type" severity="info" />
          <span class="template-card-due">{{ t.days_until_due }} day{{ t.days_until_due === 1 ? '' : 's' }} after event</span>
        </div>
        <p v-if="t.notes" class="template-card-notes">{{ t.notes }}</p>
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
        <div class="form-row">
          <label>Notes</label>
          <Textarea v-model="createForm.notes" rows="3" autoResize />
        </div>
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
        <Button label="Cancel" severity="secondary" text @click="showCreateDialog = false" />
        <Button label="Save" :loading="saving" :disabled="!canSaveCreate" @click="handleCreate" />
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
        <div class="form-row">
          <label>Notes</label>
          <Textarea v-model="editForm.notes" rows="3" autoResize />
        </div>
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
        <Button
          label="Delete"
          severity="danger"
          text
          @click="showDeleteDialog = true"
          class="delete-button"
        />
        <Button label="Cancel" severity="secondary" text @click="showEditDialog = false" />
        <Button label="Save" :loading="saving" :disabled="!canSaveEdit" @click="handleEdit" />
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
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
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
  createForm.value = {
    title: '',
    notes: '',
    todo_type: null,
    days_until_due: 0,
    order: selectedTemplates.value.length,
  }
  showCreateDialog.value = true
}

async function handleCreate() {
  if (!selectedType.value || !createForm.value.todo_type) return
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
  justify-content: space-between;
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

.template-card-due {
  font-size: 0.8rem;
  color: var(--p-surface-500);
}

.template-card-notes {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: var(--p-surface-600);
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

.delete-button {
  margin-right: auto;
}
</style>
