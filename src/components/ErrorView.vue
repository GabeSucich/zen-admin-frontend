<template>
  <div v-if="errors.length" class="error-stack">
    <Message
      v-for="(error, index) in errors"
      :key="index"
      severity="error"
      :closable="true"
      @close="dismiss(index)"
    >
      {{ error }}
    </Message>
  </div>
</template>

<script setup lang="ts">
import Message from 'primevue/message'
import { useGlobalErrors } from '@/stores/errors'

const { errors, dismiss } = useGlobalErrors()
</script>

<style scoped>
.error-stack {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
}
</style>
