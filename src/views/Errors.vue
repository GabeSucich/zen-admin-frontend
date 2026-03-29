<template>
  <div style="padding: 1.5rem;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
      <h2 style="margin: 0;">Errors</h2>
      <Button label="Refresh" icon="pi pi-refresh" @click="resetAndLoad" :loading="loading" />
    </div>

    <DataTable :value="errors" stripedRows
      :loading="loading" emptyMessage="No errors found.">
      <Column field="created_at" header="Time" style="width: 180px">
        <template #body="{ data }">
          {{ formatDate(data.created_at) }}
        </template>
      </Column>
      <Column field="endpoint" header="Endpoint" style="width: 200px" />
      <Column field="error_type" header="Type" style="width: 200px" />
      <Column header="Traceback" style="width: 100px">
        <template #body="{ data }">
          <Button v-if="data.traceback_str" icon="pi pi-eye" text rounded
            @click="selectedError = data" />
        </template>
      </Column>
    </DataTable>

    <div class="flex justify-content-center mt-3">
      <Button v-if="nextCursor !== null" label="Load more" icon="pi pi-arrow-down" text
        @click="loadErrors" :loading="loading" />
    </div>

    <Dialog v-model:visible="showTraceback" header="Traceback" modal :style="{ width: '70vw' }">
      <pre class="text-sm" style="white-space: pre-wrap; word-break: break-word;">{{ selectedError?.traceback_str }}</pre>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import { requestWrapper } from '@/api/client'
import { ErrorsService } from '@/api'
import type { ErrorResponse } from '@/api'

const errors = ref<ErrorResponse[]>([])
const nextCursor = ref<number | null>(null)
const loading = ref(false)
const selectedError = ref<ErrorResponse | null>(null)

const showTraceback = computed({
  get: () => selectedError.value !== null,
  set: (v) => { if (!v) selectedError.value = null },
})

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString()
}

function resetAndLoad() {
  errors.value = []
  nextCursor.value = null
  loadErrors()
}

async function loadErrors() {
  loading.value = true
  try {
    const res = await requestWrapper(
      ErrorsService.listErrors(
        1,
        nextCursor.value ?? undefined,
      ),
    )
    errors.value = [...errors.value, ...res.items]
    nextCursor.value = res.next_cursor ?? null
  } catch {
    // handled by requestWrapper
  } finally {
    loading.value = false
  }
}

onMounted(loadErrors)
</script>
