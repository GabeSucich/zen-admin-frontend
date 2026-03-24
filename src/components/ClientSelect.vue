<template>
  <Select
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :options="clientOptions"
    optionLabel="label"
    optionValue="value"
    :placeholder="placeholder"
    filter
    autoFilterFocus
    resetFilterOnHide
    showClear
    :class="$attrs.class"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Select from 'primevue/select'
import { useClientStore } from '@/stores/clients'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  modelValue: number | null
  placeholder?: string
}>(), {
  placeholder: 'Select a client',
})

defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const { confirmedClients } = useClientStore()

const clientOptions = computed(() =>
  confirmedClients.value.map((c) => ({
    label: `${c.first_name} ${c.last_name}`,
    value: c.id,
  })),
)
</script>
