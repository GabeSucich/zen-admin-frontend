<template>
  <div class="create-edit-footer">
    <Button
      v-if="showDelete"
      label="Delete"
      severity="danger"
      text
      class="delete-button"
      @click="$emit('delete')"
    />
    <Button label="Cancel" severity="secondary" text @click="$emit('cancel')" />
    <Button
      :label="saveLabel"
      :loading="loading"
      :disabled="disabled"
      class="save-btn"
      @click="$emit('save')"
    />
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'

withDefaults(defineProps<{
  saveLabel?: string
  loading?: boolean
  disabled?: boolean
  showDelete?: boolean
}>(), {
  saveLabel: 'Save',
  loading: false,
  disabled: false,
  showDelete: false,
})

defineEmits<{
  save: []
  cancel: []
  delete: []
}>()
</script>

<style scoped>
.create-edit-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  width: 100%;
}

.delete-button {
  margin-right: auto;
}

.save-btn {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

.save-btn:hover {
  background: #1e40af;
  border-color: #1e40af;
}
</style>
