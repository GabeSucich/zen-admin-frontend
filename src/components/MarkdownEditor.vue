<template>
  <div class="markdown-editor">
    <div class="markdown-editor-header">
      <label>{{ label }}</label>
      <div class="markdown-toggle-group">
        <button type="button" class="markdown-toggle-btn" :class="{ active: !previewing }" @click="previewing = false">Edit</button>
        <button type="button" class="markdown-toggle-btn" :class="{ active: previewing }" @click="previewing = true">Preview</button>
      </div>
    </div>
    <div v-if="previewing" class="markdown-preview" v-html="rendered" />
    <Textarea v-else :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" :rows="rows" autoResize />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Textarea from 'primevue/textarea'
import { marked } from 'marked'

marked.setOptions({ breaks: true })

const props = withDefaults(defineProps<{
  modelValue: string
  label?: string
  rows?: number
}>(), {
  label: 'Notes',
  rows: 3,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const previewing = ref(false)

const rendered = computed(() => marked(props.modelValue || ''))

defineExpose({ resetPreview: () => { previewing.value = false } })
</script>

<style scoped>
.markdown-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.markdown-editor-header label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--p-surface-600);
}

.markdown-toggle-group {
  display: flex;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  overflow: hidden;
}

.markdown-toggle-btn {
  padding: 0.15rem 0.5rem;
  border: none;
  background: none;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  color: #3b82f6;
}

.markdown-toggle-btn + .markdown-toggle-btn {
  border-left: 1px solid #3b82f6;
}

.markdown-toggle-btn.active {
  background: #3b82f6;
  color: white;
}

.markdown-preview {
  border: 1px solid var(--p-surface-200);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  min-height: 4rem;
  font-size: 0.85rem;
  color: var(--p-surface-600);
}

.markdown-preview :deep(p) {
  margin: 0 0 0.5rem;
}

.markdown-preview :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  margin: 0 0 0.5rem;
  padding-left: 1.25rem;
}

.markdown-preview :deep(code) {
  background: var(--p-surface-100);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-size: 0.8rem;
}

.markdown-editor :deep(textarea) {
  width: 100%;
}
</style>
