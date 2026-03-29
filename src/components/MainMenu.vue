<template>
  <Menubar :model="items" @click="handleMenuClick">
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
      <Button
        icon="pi pi-sign-out"
        label="Logout"
        severity="secondary"
        text
        @click="$emit('logout')"
      />
    </template>
  </Menubar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Menubar from 'primevue/menubar'
import Badge from 'primevue/badge'
import Button from 'primevue/button'
import logo from '@/assets/images/zenlogo_nobackground_resized_md.png'
// import { useClientStore } from '@/stores/clients'
import { useTodoStore } from '@/stores/todos'

defineProps<{ refreshing: boolean }>()
defineEmits<{ refresh: []; logout: [] }>()

const route = useRoute()
const router = useRouter()
const { upcomingCount } = useTodoStore()
const showErrors = ref(false)

function handleMenuClick(event: MouseEvent) {
  if (event.altKey) {
    showErrors.value = !showErrors.value
  }
}

const items = computed(() => {
  const base = [
    {
      label: 'Meetings',
      icon: 'pi pi-calendar',
      route: '/meetings',
      command: () => router.push('/meetings'),
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
  ]
  if (showErrors.value) {
    base.push({ label: 'Errors', icon: 'pi pi-exclamation-triangle', route: '/errors', command: () => router.push('/errors') })
  }
  return base
})
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
