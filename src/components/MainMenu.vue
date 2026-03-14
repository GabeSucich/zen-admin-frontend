<template>
  <Menubar :model="items">
    <template #start>
      <img :src="logo" alt="Zen Admin" class="menu-logo" />
    </template>
    <template #item="{ item, props }">
      <a v-bind="props.action" :class="{ 'active-tab': route.path.startsWith(item.route) }">
        <span :class="item.icon" />
        <span>{{ item.label }}</span>
        <Badge
          v-if="item.badge"
          :value="item.badge"
          severity="info"
          class="menu-badge"
        />
      </a>
    </template>
    <template #end>
      <Button
        icon="pi pi-refresh"
        label="Refresh Dashboard"
        :loading="refreshing"
        severity="secondary"
        text
        @click="$emit('refresh')"
      />
    </template>
  </Menubar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Menubar from 'primevue/menubar'
import Badge from 'primevue/badge'
import Button from 'primevue/button'
import logo from '@/assets/images/zenlogo_nobackground_resized_md.png'
// import { useClientStore } from '@/stores/clients'
import { useSuggestionsStore } from '@/stores/suggestions'
import { useTodoStore } from '@/stores/todos'

defineProps<{ refreshing: boolean }>()
defineEmits<{ refresh: [] }>()

const route = useRoute()
const router = useRouter()
// const { confirmedClientsWithIncompleteData } = useClientStore()
const { suggestions } = useSuggestionsStore()
const { upcomingCount } = useTodoStore()

const items = computed(() => [
  {
    label: 'Calendar Events',
    icon: 'pi pi-calendar',
    route: '/calendar-events',
    command: () => router.push('/calendar-events'),
    badge: suggestions.value.length || null,
  },
  {
    label: 'Todos',
    icon: 'pi pi-check-square',
    route: '/todos',
    command: () => router.push('/todos'),
    badge: upcomingCount.value || null,
  },
  {
    label: 'Clients',
    icon: 'pi pi-users',
    route: '/clients',
    command: () => router.push('/clients'),
    // badge: confirmedClientsWithIncompleteData.value.length || null,
  },
  { label: 'Templates', icon: 'pi pi-file-edit', route: '/templates', command: () => router.push('/templates') },
])
</script>

<style scoped>
.menu-logo {
  height: 32px;
  margin-right: 0.5rem;
}

.menu-badge {
  margin-left: 0.5rem;
  border-radius: 4px;
}

:deep(.p-menubar-item:has(.active-tab) > .p-menubar-item-content) {
  border-bottom: 2px solid currentColor;
}

:deep(.p-menubar-item:not(:hover) > .p-menubar-item-content) {
  background: transparent !important;
  color: inherit !important;
}
</style>
